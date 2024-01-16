// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ERock, EResource } from "src/Types.sol";
import { IsFleet, MaxResourceCount, NewBattleResult, NewBattleResultData, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetAttributesData, FleetAttributes, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/LibFleet.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { LibFleetDisband } from "libraries/LibFleetDisband.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibFleetStance } from "libraries/LibFleetStance.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetCombat {
  function fleetAttackFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 targetFleet
  ) internal {
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
      return;
    }

    require(LibFleet.isFleetInGracePeriod(targetFleet) == false, "[Fleet] Target fleet is in grace period");

    (
      FleetAttributesData memory sumAttackerAttributes,
      bytes32[] memory followingAttackerFleets
    ) = getFleetSumAttributes(fleetId);

    (FleetAttributesData memory sumTargetAttributes, bytes32[] memory followingTargetFleets) = getFleetSumAttributes(
      targetFleet
    );

    uint256 attackerDamage = (sumAttackerAttributes.attack * sumAttackerAttributes.hp) / sumAttackerAttributes.maxHp;

    uint256 targetDamage = (sumTargetAttributes.defense * sumTargetAttributes.hp) / sumTargetAttributes.maxHp;

    bytes32 battleId = LibEncode.getTimedHash(spaceRock);

    NewBattleResultData memory battleResult = NewBattleResultData({
      aggressorEntity: fleetId,
      targetEntity: targetFleet,
      aggressorAllies: followingAttackerFleets,
      targetAllies: followingTargetFleets,
      winner: attackerDamage > targetDamage ? fleetId : targetFleet,
      rock: spaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);

    if (attackerDamage > targetDamage) {
      resolveBattleRaid(battleResult, sumAttackerAttributes, sumTargetAttributes);
    }

    resolveBattleDamage(battleResult, sumAttackerAttributes, sumTargetAttributes);
  }

  function fleetAttackSpaceRock(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 targetSpaceRock
  ) internal {
    require(FleetStance.getStance(fleetId) == 0, "[Fleet] Aggressor fleet can not be in a stance");

    (
      FleetAttributesData memory sumAttackerAttributes,
      bytes32[] memory followingAttackerFleets
    ) = getFleetSumAttributes(fleetId);

    (
      FleetAttributesData memory sumTargetAttributes,
      bytes32[] memory defendingTargetFleets
    ) = getSpaceRockSumAttributes(targetSpaceRock);

    uint256 attackerDamage = (sumAttackerAttributes.attack * sumAttackerAttributes.hp) / sumAttackerAttributes.maxHp;

    uint256 targetDamage = (sumTargetAttributes.defense * sumTargetAttributes.hp) / sumTargetAttributes.maxHp;

    bytes32 battleId = LibEncode.getTimedHash(targetSpaceRock);

    NewBattleResultData memory battleResult = NewBattleResultData({
      aggressorEntity: fleetId,
      targetEntity: targetSpaceRock,
      aggressorAllies: followingAttackerFleets,
      targetAllies: defendingTargetFleets,
      winner: attackerDamage > targetDamage ? fleetId : targetSpaceRock,
      rock: targetSpaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);

    if (attackerDamage > targetDamage) {
      resolveBattleRaid(battleResult, sumAttackerAttributes, sumTargetAttributes);
    }

    resolveBattleDamage(battleResult, sumAttackerAttributes, sumTargetAttributes);
    resolveBattleEncryption(battleResult, sumAttackerAttributes);
  }

  function spaceRockAttackFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 targetFleet
  ) internal {
    require(LibFleet.isFleetInGracePeriod(targetFleet) == false, "[Fleet] Target fleet is in grace period");

    (
      FleetAttributesData memory sumAttackerAttributes,
      bytes32[] memory defendingAttackerFleets
    ) = getSpaceRockSumAttributes(spaceRock);

    (FleetAttributesData memory sumTargetAttributes, bytes32[] memory followingTargetFleets) = getFleetSumAttributes(
      targetFleet
    );

    uint256 attackerDamage = (sumAttackerAttributes.defense * sumAttackerAttributes.hp) / sumAttackerAttributes.maxHp;

    uint256 targetDamage = (sumTargetAttributes.attack * sumTargetAttributes.hp) / sumTargetAttributes.maxHp;

    bytes32 battleId = LibEncode.getTimedHash(spaceRock);

    NewBattleResultData memory battleResult = NewBattleResultData({
      aggressorEntity: spaceRock,
      targetEntity: targetFleet,
      aggressorAllies: defendingAttackerFleets,
      targetAllies: followingTargetFleets,
      winner: attackerDamage > targetDamage ? spaceRock : targetFleet,
      rock: spaceRock,
      timestamp: block.timestamp
    });

    NewBattleResult.set(battleId, battleResult);

    resolveBattleDamage(battleResult, sumAttackerAttributes, sumTargetAttributes);
  }

  function resolveBattleEncryption(
    NewBattleResultData memory battleResult,
    FleetAttributesData memory sumAttackerAttributes
  ) internal {
    uint256 encryption = sumAttackerAttributes.encryption;
    if (encryption == 0) return;
    LibStorage.decreaseStoredResource(battleResult.targetEntity, uint8(EResource.R_Encryption), encryption);
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

  function resolveBattleRaid(
    NewBattleResultData memory battleResult,
    FleetAttributesData memory sumAttackerAttributes,
    FleetAttributesData memory sumTargetAttributes
  ) internal {
    uint256 attackerDamage = (sumAttackerAttributes.attack * sumAttackerAttributes.hp) / sumAttackerAttributes.maxHp;

    uint256 targetDamage = (sumTargetAttributes.defense * sumTargetAttributes.hp) / sumTargetAttributes.maxHp;

    uint256 maxRaidAmount = ((attackerDamage - targetDamage) * sumAttackerAttributes.cargo) / attackerDamage;

    //can only raid up to the amount of free cargo space
    if (maxRaidAmount > sumAttackerAttributes.cargo - sumAttackerAttributes.occupiedCargo) {
      maxRaidAmount = sumAttackerAttributes.cargo - sumAttackerAttributes.occupiedCargo;
    }

    uint256[] memory raidAmounts = new uint256[](NUM_RESOURCE);
    uint256 raidAmountLeft = maxRaidAmount;
    //apply raid losses to target fleet

    (raidAmounts, raidAmountLeft) = calculateRaidFrom(
      battleResult.targetEntity,
      raidAmounts,
      maxRaidAmount,
      raidAmountLeft,
      sumTargetAttributes.occupiedCargo
    );

    //apply raid losses to following fleets
    for (uint256 i = 0; i < battleResult.targetAllies.length; i++) {
      if (raidAmountLeft == 0) break;
      (raidAmounts, raidAmountLeft) = calculateRaidFrom(
        battleResult.targetAllies[i],
        raidAmounts,
        maxRaidAmount,
        raidAmountLeft,
        sumTargetAttributes.occupiedCargo
      );
    }

    // this should be true require(raidAmountLeft == 0, "[Fleet] Raid amount left is not 0");

    //apply raid gains to attacker fleet
    applyRaidToFleet(battleResult.aggressorEntity, sumAttackerAttributes.maxHp, raidAmounts);

    //apply raid gains to following fleets
    for (uint256 i = 0; i < battleResult.aggressorAllies.length; i++) {
      applyRaidToFleet(battleResult.aggressorAllies[i], sumAttackerAttributes.maxHp, raidAmounts);
    }
  }

  function resolveBattleDamage(
    NewBattleResultData memory battleResult,
    FleetAttributesData memory sumAttackerAttributes,
    FleetAttributesData memory sumTargetAttributes
  ) internal {
    uint256 attackerDamage = (sumAttackerAttributes.attack * sumAttackerAttributes.hp) / sumAttackerAttributes.maxHp;

    uint256 targetDamage = (sumTargetAttributes.defense * sumTargetAttributes.hp) / sumTargetAttributes.maxHp;

    //apply raid losses to target fleet
    applyDamageToFleet(
      battleResult.targetEntity,
      (attackerDamage * FleetAttributes.getHp(battleResult.targetEntity)) / sumTargetAttributes.hp
    );

    //apply raid losses to following fleets
    for (uint256 i = 0; i < battleResult.targetAllies.length; i++) {
      applyDamageToFleet(
        battleResult.targetAllies[i],
        (attackerDamage * FleetAttributes.getHp(battleResult.targetAllies[i])) / sumTargetAttributes.hp
      );
    }

    FleetAttributesData memory fleetAttributes = FleetAttributes.get(battleResult.aggressorEntity);

    applyDamageToFleet(
      battleResult.aggressorEntity,
      (targetDamage * FleetAttributes.getHp(battleResult.aggressorEntity)) / sumAttackerAttributes.hp
    );

    //apply raid gains to following fleets

    for (uint256 i = 0; i < battleResult.aggressorAllies.length; i++) {
      applyDamageToFleet(
        battleResult.aggressorAllies[i],
        (targetDamage * FleetAttributes.getHp(battleResult.aggressorAllies[i])) / sumTargetAttributes.hp
      );
    }
  }

  function calculateRaidFrom(
    bytes32 targetEntity,
    uint256[] memory raidedAmounts,
    uint256 maxRaidAmount,
    uint256 raidAmountLeft,
    uint256 totalOccupiedCargo
  ) internal returns (uint256[] memory, uint256) {
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (raidAmountLeft == 0) break;
      uint256 resourceCount = ResourceCount.get(targetEntity, i);
      if (resourceCount == 0) continue;
      uint256 resourcePortion = (resourceCount * maxRaidAmount);
      resourcePortion = (resourcePortion / totalOccupiedCargo) + (resourcePortion % totalOccupiedCargo == 0 ? 0 : 1);
      if (resourcePortion > raidAmountLeft) {
        resourcePortion = raidAmountLeft;
      }
      if (IsFleet.get(targetEntity)) {
        LibFleet.decreaseFleetResource(targetEntity, i, resourcePortion);
      } else {
        LibStorage.decreaseStoredResource(targetEntity, i, resourcePortion);
      }
      raidedAmounts[i] += resourcePortion;
      raidAmountLeft -= resourcePortion;
    }
    return (raidedAmounts, raidAmountLeft);
  }

  function applyRaidToFleet(
    bytes32 targetEntity,
    uint256 maxHp,
    uint256[] memory raidAmounts
  ) internal {
    FleetAttributesData memory fleetAttributes = FleetAttributes.get(targetEntity);
    uint256 freeSpace = fleetAttributes.cargo - fleetAttributes.occupiedCargo;
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (freeSpace == 0) break;
      if (raidAmounts[i] == 0) continue;
      uint256 raidedAmount = (raidAmounts[i] * fleetAttributes.attack * fleetAttributes.hp) / maxHp;
      if (raidedAmount > fleetAttributes.cargo - fleetAttributes.occupiedCargo) {
        raidedAmount = fleetAttributes.cargo - fleetAttributes.occupiedCargo;
      }
      LibFleet.increaseFleetResource(targetEntity, i, raidedAmount);
      freeSpace -= raidedAmount;
    }
  }

  function getFleetSumAttributes(bytes32 fleetId)
    internal
    view
    returns (FleetAttributesData memory sumAttributes, bytes32[] memory followingFleets)
  {
    sumAttributes = FleetAttributes.get(fleetId);
    followingFleets = LibFleetStance.getFollowerFleets(fleetId);
    for (uint256 i = 0; i < followingFleets.length; i++) {
      FleetAttributesData memory followerAttributes = FleetAttributes.get(followingFleets[i]);
      sumAttributes.speed += followerAttributes.speed;
      sumAttributes.attack += followerAttributes.attack;
      sumAttributes.defense += followerAttributes.defense;
      sumAttributes.cargo += followerAttributes.cargo;
      sumAttributes.occupiedCargo += followerAttributes.occupiedCargo;
      sumAttributes.hp += followerAttributes.hp;
      sumAttributes.maxHp += followerAttributes.maxHp;
    }
  }

  function getSpaceRockSumAttributes(bytes32 spaceRock)
    internal
    view
    returns (FleetAttributesData memory sumAttributes, bytes32[] memory defendingFleets)
  {
    sumAttributes = FleetAttributesData({
      speed: 0,
      attack: 0,
      defense: 0,
      cargo: 0,
      occupiedCargo: LibResource.getTotalStoredResources(spaceRock),
      hp: ResourceCount.get(spaceRock, uint8(EResource.R_HP)),
      maxHp: MaxResourceCount.get(spaceRock, uint8(EResource.R_HP)),
      encryption: 0
    });

    defendingFleets = LibFleetStance.getDefendingFleets(spaceRock);
    for (uint256 i = 0; i < defendingFleets.length; i++) {
      FleetAttributesData memory followerAttributes = FleetAttributes.get(defendingFleets[i]);
      sumAttributes.speed += followerAttributes.speed;
      sumAttributes.attack += followerAttributes.attack;
      sumAttributes.defense += followerAttributes.defense;
      sumAttributes.cargo += followerAttributes.cargo;
      sumAttributes.occupiedCargo += followerAttributes.occupiedCargo;
      sumAttributes.hp += followerAttributes.hp;
      sumAttributes.maxHp += followerAttributes.maxHp;
    }
  }

  function applyDamageToSpaceRock(bytes32 spaceRock, uint256 damage) internal {
    LibStorage.decreaseStoredResource(spaceRock, uint8(EResource.R_HP), damage);
  }

  function applyDamageToFleet(bytes32 fleetId, uint256 damage) internal {
    uint256 currHp = FleetAttributes.getHp(fleetId);
    if (damage > currHp) {
      FleetAttributes.setHp(fleetId, 0);
    } else {
      FleetAttributes.setHp(fleetId, currHp - damage);
    }
    applyCasualtiesToFleet(fleetId, damage);
  }

  function applyCasualtiesToFleet(bytes32 fleetId, uint256 damage) internal {
    uint256 fleetMaxHp = FleetAttributes.getMaxHp(fleetId);
    bytes32 spaceRockEntity = OwnedBy.get(fleetId);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256 damageLeft = damage;
    uint256[] memory casualties = new uint256[](NUM_UNITS);

    uint256 cargoLost = 0;
    uint256 cargoCapacity = FleetAttributes.getCargo(fleetId);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      if (damageLeft == 0) break;

      uint256 unitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      if (unitCount == 0) continue;

      uint256 level = UnitLevel.get(spaceRockEntity, unitPrototypes[i]);
      uint256 hp = P_Unit.getHp(unitPrototypes[i], level);
      uint256 damagePortion = (unitCount * hp * damage);
      damagePortion = damagePortion / fleetMaxHp + (damagePortion % fleetMaxHp == 0 ? 0 : 1);
      if (damagePortion > damageLeft) {
        damagePortion = damageLeft;
      }
      uint256 casualty = (damagePortion / hp) + (damagePortion % hp == 0 ? 0 : 1);

      damagePortion = casualty * hp;
      if (damagePortion > damageLeft) {
        damagePortion = damageLeft;
      }
      damageLeft -= damagePortion;
      casualties[i] = casualty;

      cargoLost += casualty * P_Unit.getCargo(unitPrototypes[i], level);
    }

    applyLostCargo(fleetId, cargoLost);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      if (casualties[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], casualties[i], true);
    }
  }

  function applyLostCargo(bytes32 fleetId, uint256 cargoLost) internal {
    uint256 occupiedCargo = FleetAttributes.getOccupiedCargo(fleetId);
    uint256 availableCargo = FleetAttributes.getCargo(fleetId) - FleetAttributes.getOccupiedCargo(fleetId);
    if (cargoLost > availableCargo) {
      cargoLost -= availableCargo;
      uint256 cargoLossLeft = cargoLost;
      for (uint8 i = 0; i < NUM_RESOURCE; i++) {
        if (cargoLossLeft == 0) break;
        uint256 resourceCount = ResourceCount.get(fleetId, i);
        if (resourceCount == 0) continue;
        uint256 resourcePortion = (resourceCount * cargoLost);
        resourcePortion = (resourcePortion / occupiedCargo) + (resourcePortion % occupiedCargo == 0 ? 0 : 1);
        if (resourcePortion > cargoLossLeft) {
          resourcePortion = cargoLossLeft;
        }
        LibFleet.decreaseFleetResource(fleetId, i, resourcePortion);
      }
    }
  }
}
