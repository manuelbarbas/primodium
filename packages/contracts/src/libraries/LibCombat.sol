// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { P_ColonyShipConfig, CooldownEnd, DamageDealt, BattleEncryptionResult, BattleDamageDealtResult, BattleDamageTakenResult, BattleUnitResult, BattleUnitResultData, P_Transportables, IsFleet, BattleResult, BattleResultData, FleetMovement, GracePeriod, UnitCount, P_Unit, UnitLevel, P_GameConfig, ResourceCount, OwnedBy, P_UnitPrototypes, P_CooldownConfig, P_CooldownConfigData } from "codegen/index.sol";

import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibPoints } from "libraries/LibPoints.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetIncomingKey } from "src/Keys.sol";
import { EResource } from "src/Types.sol";
import { ABDKMath64x64 as Math } from "abdk/ABDKMath64x64.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

/**
 * @title LibCombat
 * @dev Library for handling combat mechanics in a game, including attacks, damage calculations, and battle results.
 */
library LibCombat {
  /**
   * @notice Initiates an attack from one entity to another, calculating the battle results.
   * @param entity The attacking entity.
   * @param targetEntity The target entity being attacked.
   * @return battleEntity The unique identifier for this battle instance.
   * @return battleResult The outcome of the battle, including damages and winner.
   */
  function attack(
    bytes32 entity,
    bytes32 targetEntity
  ) internal returns (bytes32 battleEntity, BattleResultData memory battleResult) {
    bool aggressorIsFleet = IsFleet.get(entity);

    if (GracePeriod.get(entity) > 0) GracePeriod.deleteRecord(entity);

    bytes32 asteroidEntity = aggressorIsFleet ? FleetMovement.getDestination(entity) : entity;

    battleEntity = LibEncode.getTimedHash(asteroidEntity);
    uint256 totalAggressorDamage = handleDamage(entity, battleEntity, aggressorIsFleet);

    // update grace period of asteroid and fleet on asteroid
    if (aggressorIsFleet) {
      bytes32 ownerEntity = OwnedBy.get(entity);
      if (GracePeriod.get(ownerEntity) > 0) GracePeriod.deleteRecord(ownerEntity);
    }

    uint256 totalTargetDamage = handleDamage(targetEntity, battleEntity, !aggressorIsFleet);

    battleResult = BattleResultData({
      aggressorEntity: entity,
      targetEntity: targetEntity,
      aggressorAllies: LibFleetStance.getAllies(entity),
      targetDamage: totalTargetDamage,
      aggressorDamage: totalAggressorDamage,
      targetAllies: LibFleetStance.getAllies(targetEntity),
      winnerEntity: totalAggressorDamage > totalTargetDamage ? entity : targetEntity,
      playerEntity: OwnedBy.get(aggressorIsFleet ? OwnedBy.get(entity) : entity),
      targetPlayerEntity: OwnedBy.get(IsFleet.get(targetEntity) ? OwnedBy.get(targetEntity) : targetEntity),
      asteroidEntity: asteroidEntity,
      timestamp: block.timestamp
    });

    BattleResult.set(battleEntity, battleResult);
  }

  /**
   * @notice Handles the damage calculations for an entity involved in a battle.
   * @param entity The entity (aggressor or defender) for which to calculate damage.
   * @param battleEntity The unique identifier for the battle instance.
   * @param isAggressor Boolean indicating whether the entity is the aggressor.
   * @return totalDamage The total damage dealt by the entity.
   */
  function handleDamage(bytes32 entity, bytes32 battleEntity, bool isAggressor) internal returns (uint256 totalDamage) {
    uint256 damage;
    uint256[] memory damages;

    (damage, damages, totalDamage) = isAggressor
      ? LibCombatAttributes.getAttacksWithAllies(entity)
      : LibCombatAttributes.getDefensesWithAllies(entity);

    BattleDamageDealtResult.set(battleEntity, entity, damage);

    bytes32[] memory allies = LibFleetStance.getAllies(entity);
    for (uint256 i = 0; i < allies.length; i++) {
      BattleDamageDealtResult.set(battleEntity, allies[i], damages[i]);
    }
  }

  /**
   * @notice Resolves the encryption aspect of a battle, particularly relevant when a colony ship is involved.
   * @param battleEntity The unique identifier for the battle instance.
   * @param targetAsteroidEntity The asteroid entity involved in the battle, if any.
   * @param aggressorEntity The aggressor entity in the battle.
   * @return encryptionAtEnd The encryption level of the asteroid after the battle.
   */
  function resolveBattleEncryption(
    bytes32 battleEntity,
    bytes32 targetAsteroidEntity,
    bytes32 aggressorEntity
  ) internal returns (uint256 encryptionAtEnd) {
    uint256 encryptionAtStart = ResourceCount.get(targetAsteroidEntity, uint8(EResource.R_Encryption));
    uint256 decryption = P_ColonyShipConfig.getDecryption();
    encryptionAtEnd = encryptionAtStart;
    if (encryptionAtStart != 0) {
      if (decryption > encryptionAtStart) {
        decryption = encryptionAtStart;
      }
      if (decryption != 0) {
        LibStorage.decreaseStoredResource(targetAsteroidEntity, uint8(EResource.R_Encryption), decryption);
        encryptionAtEnd = ResourceCount.get(targetAsteroidEntity, uint8(EResource.R_Encryption));
      }
    }
    if (encryptionAtEnd == 0) {
      LibFleet.decreaseFleetUnit(aggressorEntity, ColonyShipPrototypeId, 1, true);
    }
    BattleEncryptionResult.set(battleEntity, targetAsteroidEntity, encryptionAtStart, encryptionAtEnd);
  }

  /**
   * @notice Applies damage to an entity, calculating the resultant damage dealt.
   * @param battleEntity The unique identifier for the battle instance.
   * @param attackingPlayer The player entity initiating the attack.
   * @param defender The defending entity receiving damage.
   * @param damage The amount of damage being applied.
   * @return damageDealt The actual damage dealt after calculations.
   */
  function applyDamage(
    bytes32 battleEntity,
    bytes32 attackingPlayer,
    bytes32 defender,
    uint256 damage
  ) internal returns (uint256 damageDealt) {
    if (damage == 0) return 0;

    // get total hp of target and their allies as damage will be split between them
    (uint256 hp, uint256[] memory hps, uint256 totalHp) = LibCombatAttributes.getHpsWithAllies(defender);

    if (totalHp == 0) return 0;

    if (damage > totalHp) {
      damage = totalHp;
    }

    damageDealt = 0;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory totalUnitCasualties = new uint256[](unitPrototypes.length);
    if (IsFleet.get(defender)) {
      (damageDealt, totalUnitCasualties) = applyDamageToUnits(
        battleEntity,
        defender,
        totalHp,
        damage,
        totalUnitCasualties
      );
    } else {
      (damageDealt, totalUnitCasualties) = applyDamageToAsteroid(
        battleEntity,
        defender,
        totalHp,
        damage,
        totalUnitCasualties
      );
    }

    BattleDamageTakenResult.set(battleEntity, defender, hp, damageDealt);

    if (damageDealt < damage) {
      bytes32[] memory allies = LibFleetStance.getAllies(defender);
      for (uint256 i = 0; i < allies.length; i++) {
        uint256 damageDealtToAlly = 0;
        (damageDealtToAlly, totalUnitCasualties) = applyDamageToUnits(
          battleEntity,
          allies[i],
          totalHp,
          damage,
          totalUnitCasualties
        );
        BattleDamageTakenResult.set(battleEntity, allies[i], hps[i], damageDealtToAlly);
        damageDealt += damageDealtToAlly;
        if (damageDealt >= damage) {
          break;
        }
      }
    }
    DamageDealt.set(attackingPlayer, DamageDealt.get(attackingPlayer) + damageDealt);
    return damageDealt;
  }

  /**
   * @notice Specifically applies damage to an asteroid entity.
   * @param battleEntity The unique identifier for the battle instance.
   * @param asteroidEntity The asteroid entity receiving damage.
   * @param totalHp The total hit points (HP) of the asteroid and its defenses.
   * @param damage The amount of damage being applied.
   * @param totalUnitCasualties The total casualties among all unit types as a result of the damage.
   * @return damageDealt The actual damage dealt to the asteroid.
   * @return totalUnitCasualties Updated array of total unit casualties.
   */
  function applyDamageToAsteroid(
    bytes32 battleEntity,
    bytes32 asteroidEntity,
    uint256 totalHp,
    uint256 damage,
    uint256[] memory totalUnitCasualties
  ) internal returns (uint256 damageDealt, uint256[] memory) {
    if (damage == 0 || totalHp == 0) return (0, totalUnitCasualties);
    uint256 currHp = ResourceCount.get(asteroidEntity, uint8(EResource.R_HP));
    damageDealt = 0;

    uint256 damagePortion = (currHp * damage) / totalHp;
    LibStorage.decreaseStoredResource(asteroidEntity, uint8(EResource.R_HP), damagePortion);
    damageDealt += damagePortion;

    if (damageDealt >= damage) return (damageDealt, totalUnitCasualties);
    uint256 damageToUnits = 0;
    (damageToUnits, totalUnitCasualties) = applyDamageToUnits(
      battleEntity,
      asteroidEntity,
      totalHp - currHp,
      damage - damageDealt,
      totalUnitCasualties
    );
    damageDealt += damageToUnits;
    return (damageDealt, totalUnitCasualties);
  }

  /**
   * @notice Applies damage to units, calculating the casualties and remaining forces.
   * @param battleEntity The unique identifier for the battle instance.
   * @param targetEntity The entity whose units are receiving damage.
   * @param totalHp The total hit points (HP) of the units.
   * @param damage The amount of damage being applied.
   * @param totalUnitCasualties Array tracking the total casualties per unit type.
   * @return damageDealt The total damage dealt to the units.
   * @return totalUnitCasualties Updated array of total unit casualties.
   */
  function applyDamageToUnits(
    bytes32 battleEntity,
    bytes32 targetEntity,
    uint256 totalHp,
    uint256 damage,
    uint256[] memory totalUnitCasualties
  ) internal returns (uint256 damageDealt, uint256[] memory) {
    if (damage == 0 || totalHp == 0) return (0, totalUnitCasualties);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    BattleUnitResultData memory unitResult = BattleUnitResultData({
      unitsAtStart: new uint256[](unitPrototypes.length),
      unitLevels: new uint256[](unitPrototypes.length),
      casualties: new uint256[](unitPrototypes.length)
    });

    uint256 unitsKilled = 0;
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      unitResult.unitsAtStart[i] = UnitCount.get(targetEntity, unitPrototypes[i]);
      if (unitResult.unitsAtStart[i] == 0) continue;
      bytes32 asteroidEntity = IsFleet.get(targetEntity) ? OwnedBy.get(targetEntity) : targetEntity;
      unitResult.unitLevels[i] = UnitLevel.get(asteroidEntity, unitPrototypes[i]);
      uint256 unitHp = P_Unit.getHp(unitPrototypes[i], unitResult.unitLevels[i]);
      uint256 damagePortion = LibMath.divideRound((unitResult.unitsAtStart[i] * unitHp * damage), totalHp);
      unitResult.casualties[i] = LibMath.divideRound(damagePortion, unitHp);
      unitsKilled += unitResult.casualties[i];

      if (unitResult.casualties[i] > unitResult.unitsAtStart[i]) unitResult.casualties[i] = unitResult.unitsAtStart[i];
      applyUnitCasualty(targetEntity, unitPrototypes[i], unitResult.casualties[i]);
      totalUnitCasualties[i] += unitResult.casualties[i];
      damagePortion = unitResult.casualties[i] * unitHp;
      damageDealt += damagePortion;
      if (damageDealt >= damage) break;
    }

    LibPoints.addUnitDeaths(unitsKilled);
    BattleUnitResult.set(battleEntity, targetEntity, unitResult);

    if (IsFleet.get(targetEntity)) {
      applyLostCargo(targetEntity);
      LibFleet.resetFleetIfNoUnitsLeft(targetEntity);
    }

    return (damageDealt, totalUnitCasualties);
  }
  /**
   * @notice Applies casualty to a specific unit type of an entity.
   * @param targetEntity The entity whose unit is taking casualties.
   * @param unitPrototype The specific unit type taking casualties.
   * @param unitCount The number of units of the specified type to apply casualties to.
   */
  function applyUnitCasualty(bytes32 targetEntity, bytes32 unitPrototype, uint256 unitCount) internal {
    if (unitCount == 0) return;
    if (IsFleet.get(targetEntity)) {
      LibFleet.decreaseFleetUnit(targetEntity, unitPrototype, unitCount, true);
    } else {
      LibUnit.decreaseUnitCount(targetEntity, unitPrototype, unitCount, true);
    }
  }
  /**
   * @notice Handles the loss of cargo for a fleet entity after taking damage.
   * @param fleetEntity The fleet entity that may lose cargo as a result of damage.
   */

  function applyLostCargo(bytes32 fleetEntity) internal {
    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetEntity);
    if (cargo >= occupiedCargo) return;

    uint256 cargoLost = occupiedCargo - cargo;
    uint256 cargoLossLeft = cargoLost;
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (cargoLossLeft == 0) break;
      uint256 resourceCount = ResourceCount.get(fleetEntity, i);
      if (resourceCount == 0) continue;

      uint256 resourcePortion = LibMath.divideCeil(resourceCount * cargoLost, occupiedCargo);
      if (resourcePortion > cargoLossLeft) {
        resourcePortion = cargoLossLeft;
      }
      LibFleet.decreaseFleetResource(fleetEntity, i, resourcePortion);
      cargoLossLeft -= resourcePortion;
    }
  }

  /**
   * @notice Calculates the cooldown time for an entity after an attack based on the attack value and whether decryption was involved.
   * @param attackVal The value of the attack which influences the cooldown duration.
   * @param withDecryption Boolean indicating whether decryption was a factor in the attack.
   * @return time The cooldown time in seconds, adjusted for game speed.
   */
  function getCooldownTime(uint256 attackVal, bool withDecryption) internal view returns (uint256 time) {
    P_CooldownConfigData memory cooldownConfig = P_CooldownConfig.get();
    time = withDecryption ? P_ColonyShipConfig.getCooldownExtension() : 0;
    attackVal = attackVal / 1e18;
    if (attackVal <= cooldownConfig.linSwitch) time += (attackVal * cooldownConfig.linNum) / cooldownConfig.linDen;
    else {
      int128 divided = Math.add(Math.divu(attackVal, cooldownConfig.logDiv), Math.fromUInt(1));
      time += Math.mulu(Math.log_2(divided), cooldownConfig.logMult) + cooldownConfig.logAdd;
    }
    time *= 60;
    return (time * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
  }
}
