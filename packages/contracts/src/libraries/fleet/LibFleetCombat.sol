// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { BattleEncryptionResult, BattleDamageDealtResult, BattleDamageTakenResult, BattleUnitResult, BattleUnitResultData, P_Transportables, IsFleet, MaxResourceCount, NewBattleResult, NewBattleResultData, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibSpaceRockAttributes } from "libraries/LibSpaceRockAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetCombat {
  function getDefensesWithAllies(bytes32 entity) internal view returns (uint256[] memory, uint256) {
    return
      IsFleet.get(entity)
        ? LibFleetAttributes.getDefensesWithFollowers(entity)
        : LibSpaceRockAttributes.getDefensesWithDefenders(entity);
  }

  function attack(bytes32 entity, bytes32 targetEntity)
    internal
    returns (bytes32 battleId, NewBattleResultData memory battleResult)
  {
    bool aggressorIsFleet = IsFleet.get(entity);

    bytes32 spaceRock = aggressorIsFleet ? FleetMovement.getDestination(entity) : entity;

    battleId = LibEncode.getTimedHash(spaceRock);

    (uint256[] memory aggressorDamages, uint256 aggressorDamage) = aggressorIsFleet
      ? LibFleetAttributes.getAttacksWithFollowers(entity)
      : LibSpaceRockAttributes.getDefensesWithDefenders(entity);

    BattleDamageDealtResult.set(battleId, entity, aggressorDamages[0]);

    bytes32[] memory aggressorAllies = getAllies(entity);
    for (uint256 i = 0; i < aggressorAllies.length; i++) {
      BattleDamageDealtResult.set(battleId, aggressorAllies[i], aggressorDamages[i + 1]);
    }

    (uint256[] memory targetDamages, uint256 targetDamage) = aggressorIsFleet
      ? getDefensesWithAllies(targetEntity)
      : LibFleetAttributes.getAttacksWithFollowers(targetEntity);

    BattleDamageDealtResult.set(battleId, targetEntity, targetDamages[0]);

    bytes32[] memory targetAllies = getAllies(targetEntity);
    for (uint256 i = 0; i < targetAllies.length; i++) {
      BattleDamageDealtResult.set(battleId, targetAllies[i], targetDamages[i + 1]);
    }

    battleResult = NewBattleResultData({
      aggressorEntity: entity,
      aggressorDamage: aggressorDamage,
      targetEntity: targetEntity,
      targetDamage: targetDamage,
      aggressorAllies: aggressorAllies,
      targetAllies: targetAllies,
      winner: aggressorDamage > targetDamage ? entity : targetEntity,
      rock: spaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);
  }

  function resolveBattleEncryption(bytes32 battleId, NewBattleResultData memory battleResult) internal {
    if (battleResult.winner != battleResult.aggressorEntity) return;

    uint256 decryption = LibFleetAttributes.getDecryption(battleResult.aggressorEntity);
    if (decryption == 0) return;

    uint256 encryptionAtStart = ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption));

    LibStorage.decreaseStoredResource(battleResult.targetEntity, uint8(EResource.R_Encryption), decryption);

    uint256 encryptionAtEnd = ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption));

    BattleEncryptionResult.set(battleId, battleResult.targetEntity, encryptionAtStart, encryptionAtEnd);

    if (encryptionAtEnd == 0) transferSpaceRockOwnership(battleResult.rock, battleResult.aggressorEntity);
  }

  function transferSpaceRockOwnership(bytes32 spaceRock, bytes32 newOwner) internal {
    bytes32[] memory ownedFleets = FleetsMap.getFleetIds(spaceRock, FleetOwnedByKey);
    for (uint256 i = 0; i < ownedFleets.length; i++) {
      LibFleetDisband.disbandFleet(OwnedBy.get(spaceRock), ownedFleets[i]);
    }
    OwnedBy.set(spaceRock, newOwner);
  }

  function getAllies(bytes32 entity) internal view returns (bytes32[] memory) {
    return IsFleet.get(entity) ? LibFleetStance.getFollowerFleets(entity) : LibFleetStance.getDefendingFleets(entity);
  }

  function getHpWithAllies(bytes32 entity) internal view returns (uint256[] memory, uint256) {
    return
      IsFleet.get(entity)
        ? LibFleetAttributes.getHpWithFollowers(entity)
        : LibSpaceRockAttributes.getTotalHpWithDefenders(entity);
  }

  function applyDamageToWithAllies(
    bytes32 battleId,
    bytes32 entity,
    uint256 damage
  ) internal {
    if (damage == 0) return;

    // get total hp of target and their allies as damage will be split between them
    (uint256[] memory hps, uint256 totalHp) = getHpWithAllies(entity);

    if (totalHp == 0) return;

    if (damage > totalHp) {
      damage = totalHp;
    }

    uint256 damageDealt = 0;

    if (IsFleet.get(entity)) {
      damageDealt = applyDamageToUnits(battleId, entity, totalHp, damage);
    } else {
      damageDealt = applyDamageToSpaceRock(battleId, entity, totalHp, damage);
    }

    BattleDamageTakenResult.set(battleId, entity, hps[0], damageDealt);

    if (damageDealt >= damage) return;

    bytes32[] memory allies = getAllies(entity);
    for (uint256 i = 0; i < allies.length; i++) {
      uint256 damageDealtToAlly = applyDamageToUnits(battleId, allies[i], totalHp, damage);
      BattleDamageTakenResult.set(battleId, allies[i], hps[i + 1], damageDealtToAlly);
      damageDealt += damageDealtToAlly;
      if (damageDealt >= damage) return;
    }
  }

  function applyDamageToSpaceRock(
    bytes32 battleId,
    bytes32 spaceRock,
    uint256 totalHp,
    uint256 damage
  ) internal returns (uint256 damageDealt) {
    if (damage == 0) return 0;
    uint256 currHp = ResourceCount.get(spaceRock, uint8(EResource.R_HP));
    damageDealt = 0;

    uint256 damagePortion = (currHp * damage) / totalHp;
    LibStorage.decreaseStoredResource(spaceRock, uint8(EResource.R_HP), damagePortion);
    damageDealt += damagePortion;

    if (damageDealt >= damage) return damageDealt;

    damageDealt += applyDamageToUnits(battleId, spaceRock, totalHp - currHp, damage - damageDealt);

    return damageDealt;
  }

  function applyDamageToUnits(
    bytes32 battleId,
    bytes32 targetEntity,
    uint256 totalHp,
    uint256 damage
  ) internal returns (uint256 damageDealt) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    BattleUnitResultData memory unitResult = BattleUnitResultData({
      unitsAtStart: new uint256[](unitPrototypes.length),
      unitLevels: new uint256[](unitPrototypes.length),
      casualties: new uint256[](unitPrototypes.length)
    });

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      unitResult.unitsAtStart[i] = UnitCount.get(targetEntity, unitPrototypes[i]);
      if (unitResult.unitsAtStart[i] == 0) continue;
      unitResult.unitLevels[i] = UnitLevel.get(targetEntity, unitPrototypes[i]);
      uint256 unitHp = P_Unit.getHp(unitPrototypes[i], unitResult.unitLevels[i]);
      uint256 damagePortion = (unitResult.unitsAtStart[i] * unitHp * damage);
      unitResult.casualties[i] = LibMath.divideRoundNear(damagePortion, totalHp);

      applyUnitCasualty(targetEntity, unitPrototypes[i], unitResult.casualties[i]);

      damagePortion = unitResult.casualties[i] * unitHp;
      damageDealt += damagePortion;
      if (damageDealt >= damage) return damageDealt;
    }

    BattleUnitResult.set(battleId, targetEntity, unitResult);

    if (IsFleet.get(targetEntity)) {
      uint256 cargo = LibFleetAttributes.getCargo(targetEntity);
      uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(targetEntity);
      if (cargo < occupiedCargo) {
        applyLostCargo(targetEntity, cargo, occupiedCargo);
      }
    }
  }

  function applyUnitCasualty(
    bytes32 targetEntity,
    bytes32 unitPrototype,
    uint256 unitCount
  ) internal {
    if (unitCount == 0) return;
    if (IsFleet.get(targetEntity)) {
      LibFleet.decreaseFleetUnit(targetEntity, unitPrototype, unitCount, true);
    } else {
      LibUnit.decreaseUnitCount(targetEntity, unitPrototype, unitCount, true);
    }
  }

  function applyLostCargo(
    bytes32 fleetId,
    uint256 cargo,
    uint256 occupiedCargo
  ) internal {
    uint256 cargoLost = occupiedCargo - cargo;
    uint256 cargoLossLeft = cargoLost;
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (cargoLossLeft == 0) break;
      uint256 resourceCount = ResourceCount.get(fleetId, i);
      if (resourceCount == 0) continue;

      uint256 resourcePortion = LibMath.divideRoundUp(resourceCount * cargoLost, occupiedCargo);
      if (resourcePortion > cargoLossLeft) {
        resourcePortion = cargoLossLeft;
      }
      LibFleet.decreaseFleetResource(fleetId, i, resourcePortion);
      cargoLossLeft -= resourcePortion;
    }
  }
}
