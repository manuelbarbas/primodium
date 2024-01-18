// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { P_Transportables, IsFleet, MaxResourceCount, NewBattleResult, NewBattleResultData, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

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

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetCombat {
  function fleetAttackFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 targetFleet
  ) internal returns (NewBattleResultData memory battleResult) {
    bytes32 spaceRock = FleetMovement.getDestination(fleetId);

    require(FleetStance.getStance(fleetId) == 0, "[Fleet] Aggressor fleet can not be in a stance");

    uint8 targetFleetStance = FleetStance.getStance(targetFleet);

    //if target fleet is in a stance, redirect attack to target of stance
    require(
      targetFleetStance != uint8(EFleetStance.Defend),
      "[Fleet] Target fleet is defending space rock, target space rock instead"
    );

    if (targetFleetStance == uint8(EFleetStance.Follow)) {
      fleetAttackFleet(playerEntity, fleetId, FleetStance.getTarget(targetFleet));
      return battleResult;
    }

    uint256 attackerDamage = LibFleetAttributes.getAttackWithFollowers(fleetId);

    uint256 targetDamage = LibFleetAttributes.getDefenseWithFollowers(targetFleet);

    bytes32 battleId = LibEncode.getTimedHash(spaceRock);

    battleResult = NewBattleResultData({
      aggressorEntity: fleetId,
      aggressorDamage: attackerDamage,
      targetEntity: targetFleet,
      targetDamage: targetDamage,
      aggressorAllies: LibFleetStance.getFollowerFleets(fleetId),
      targetAllies: LibFleetStance.getFollowerFleets(targetFleet),
      winner: attackerDamage > targetDamage ? fleetId : targetFleet,
      rock: spaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);
  }

  function fleetAttackSpaceRock(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 targetSpaceRock
  ) internal returns (NewBattleResultData memory battleResult) {
    require(FleetStance.getStance(fleetId) == 0, "[Fleet] Aggressor fleet can not be in a stance");

    uint256 attackerDamage = LibFleetAttributes.getAttackWithFollowers(fleetId);

    uint256 targetDamage = LibSpaceRockAttributes.getDefenseWithDefenders(targetSpaceRock);

    bytes32 battleId = LibEncode.getTimedHash(targetSpaceRock);

    battleResult = NewBattleResultData({
      aggressorEntity: fleetId,
      aggressorDamage: attackerDamage,
      targetEntity: targetSpaceRock,
      targetDamage: targetDamage,
      aggressorAllies: LibFleetStance.getFollowerFleets(fleetId),
      targetAllies: LibFleetStance.getDefendingFleets(targetSpaceRock),
      winner: attackerDamage > targetDamage ? fleetId : targetSpaceRock,
      rock: targetSpaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);
  }

  function spaceRockAttackFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 targetFleet
  ) internal returns (NewBattleResultData memory battleResult) {
    uint256 attackerDamage = LibSpaceRockAttributes.getDefenseWithDefenders(spaceRock);

    uint256 targetDamage = LibFleetAttributes.getAttackWithFollowers(targetFleet);

    bytes32 battleId = LibEncode.getTimedHash(spaceRock);

    battleResult = NewBattleResultData({
      aggressorEntity: spaceRock,
      aggressorDamage: attackerDamage,
      targetEntity: targetFleet,
      targetDamage: targetDamage,
      aggressorAllies: LibFleetStance.getDefendingFleets(spaceRock),
      targetAllies: LibFleetStance.getFollowerFleets(targetFleet),
      winner: attackerDamage > targetDamage ? spaceRock : targetFleet,
      rock: spaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);
  }

  function resolveBattleEncryption(NewBattleResultData memory battleResult) internal {
    uint256 decryption = LibFleetAttributes.getDecryption(battleResult.aggressorEntity);
    if (decryption == 0) return;
    LibStorage.decreaseStoredResource(battleResult.targetEntity, uint8(EResource.R_Encryption), decryption);
    if (ResourceCount.get(battleResult.targetEntity, uint8(EResource.R_Encryption)) == 0)
      transferSpaceRockOwnership(battleResult.rock, battleResult.aggressorEntity);
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

  function applyDamageToWithAllies(bytes32 entity, uint256 damage) internal {
    if (damage == 0) return;

    (uint256[] memory hps, uint256 totalHp) = getHpWithAllies(entity);

    if (totalHp == 0) return;

    if (damage > totalHp) {
      damage = totalHp;
    }

    uint256 damageDealt = 0;

    if (IsFleet.get(entity)) {
      damageDealt = applyDamageToFleet(entity, totalHp, (damage * hps[0]) / totalHp);
    } else {
      damageDealt = applyDamageToSpaceRock(entity, totalHp, (damage * hps[0]) / totalHp);
    }

    if (damageDealt >= damage) return;

    bytes32[] memory allies = getAllies(entity);
    for (uint256 i = 0; i < allies.length; i++) {
      damageDealt += applyDamageToFleet(allies[i], totalHp, (damage * hps[i + 1]) / totalHp);
      if (damageDealt >= damage) return;
    }
  }

  function applyDamageToSpaceRock(
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

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory casualties = new uint256[](unitPrototypes.length);

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      if (unitCount == 0) continue;

      uint256 unitHp = P_Unit.getHp(unitPrototypes[i], UnitLevel.get(spaceRock, unitPrototypes[i]));
      damagePortion = (unitCount * unitHp * damage);
      casualties[i] = LibMath.divideRoundNear(damagePortion, totalHp);

      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], casualties[i], true);

      damagePortion = casualties[i] * unitHp;
      damageDealt += damagePortion;

      if (damageDealt >= damage) return damageDealt;
    }
  }

  function applyDamageToFleet(
    bytes32 fleetId,
    uint256 totalHp,
    uint256 damage
  ) internal returns (uint256 damageDealt) {
    if (damage == 0) return 0;
    damageDealt = 0;
    bytes32 spaceRock = OwnedBy.get(fleetId);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory casualties = new uint256[](unitPrototypes.length);
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      if (unitCount == 0) continue;

      uint256 unitHp = P_Unit.getHp(unitPrototypes[i], UnitLevel.get(spaceRock, unitPrototypes[i]));
      uint256 damagePortion = (unitCount * unitHp * damage);
      casualties[i] = LibMath.divideRoundNear(damagePortion, totalHp);

      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], casualties[i], true);

      damagePortion = casualties[i] * unitHp;
      damageDealt += damagePortion;

      if (damageDealt >= damage) return damageDealt;
    }

    uint256 cargo = LibFleetAttributes.getCargo(fleetId);
    uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(fleetId);
    if (cargo < occupiedCargo) {
      applyLostCargo(fleetId, cargo, occupiedCargo);
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
