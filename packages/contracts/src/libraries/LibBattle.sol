// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { addressToEntity } from "solecs/utils.sol";
//components
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { P_UnitAttackComponent, ID as P_UnitAttackComponentID } from "components/P_UnitAttackComponent.sol";
import { P_UnitDefenceComponent, ID as P_UnitDefenceComponentID } from "components/P_UnitDefenceComponent.sol";
import { P_UnitCargoComponent, ID as P_UnitCargoComponentID } from "components/P_UnitCargoComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { BattleAttackerComponent, ID as BattleAttackerComponentID } from "components/BattleAttackerComponent.sol";
import { BattleDefenderComponent, ID as BattleDefenderComponentID } from "components/BattleDefenderComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
import { BattleResult, BattleParticipant, Arrival, ESendType } from "../types.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibUnits } from "./LibUnits.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";

library LibBattle {
  function setupBattleDefender(IWorld world, uint256 battleEntity, uint256 defenderEntity, uint256 spaceRock) internal {
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );

    BattleParticipant memory defender;
    defender.participantEntity = defenderEntity;
    defender.unitTypes = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).getEntitiesWithValue(true);
    defender.unitCounts = new uint32[](defender.unitTypes.length);
    defender.unitLevels = new uint32[](defender.unitTypes.length);
    for (uint i = 0; i < defender.unitTypes.length; i++) {
      defender.unitCounts[i] = (LibUnits.getUnitCountOnRock(world, defenderEntity, spaceRock, defender.unitTypes[i]));
      defender.unitLevels[i] = LibUnits.getPlayerUnitTypeLevel(world, defenderEntity, defender.unitTypes[i]);
    }
    battleDefenderComponent.set(battleEntity, defender);
  }

  function setupBattleAttacker(
    IWorld world,
    uint256 battleEntity,
    uint256 attackerEntity,
    uint256 spaceRock,
    ESendType sendType
  ) internal {
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );

    BattleParticipant memory attacker;
    attacker.participantEntity = attackerEntity;
    attacker.unitTypes = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).getEntities();
    attacker.unitCounts = new uint32[](attacker.unitTypes.length);
    attacker.unitLevels = new uint32[](attacker.unitTypes.length);
    for (uint i = 0; i < attacker.unitTypes.length; i++) {
      attacker.unitLevels[i] = LibUnits.getPlayerUnitTypeLevel(world, attackerEntity, attacker.unitTypes[i]);
    }
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(attackerEntity, spaceRock);
    uint256 size = LibMath.getSafe(
      ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)),
      playerAsteroidEntity
    );
    uint256 index = 0;
    while (index < size) {
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);

      if (arrival.sendType != sendType) {
        index++;

        continue;
      }
      if (arrival.arrivalBlock <= block.number) {
        for (uint i = 0; i < arrival.units.length; i++) {
          attacker.unitCounts[i] += arrival.units[i].count;
        }
        ArrivalsList.remove(world, playerAsteroidEntity, index);
        size--;
      } else {
        index++;
      }
    }
    battleAttackerComponent.set(battleEntity, attacker);
  }

  function resolveBattle(IWorld world, uint256 battleEntity) internal view returns (BattleResult memory) {
    BattleResult memory battleResult;

    uint32[] memory attackerUnitCounts = BattleAttackerComponent(world.getComponent(BattleAttackerComponentID))
      .getValue(battleEntity)
      .unitCounts;
    uint32[] memory defenderUnitCounts = BattleDefenderComponent(world.getComponent(BattleDefenderComponentID))
      .getValue(battleEntity)
      .unitCounts;

    battleResult.attackerUnitsLeft = new uint32[](attackerUnitCounts.length);
    battleResult.defenderUnitsLeft = new uint32[](defenderUnitCounts.length);

    (uint32[] memory attackValues, uint32 totalAttackValue) = getTotalAttackValue(world, battleEntity);
    uint32 totalDefenceValue = getTotalDefenceValue(world, battleEntity);

    for (uint256 i = 0; i < attackerUnitCounts.length; i++) {
      uint32 attackPercentage = totalAttackValue > 0 ? (attackValues[i] * 100) / totalAttackValue : 0;
      uint32 defendToward = (totalDefenceValue * attackPercentage) / 100;
      uint32 battleRatio = 0;
      if (defendToward > 0) {
        battleRatio = (defendToward * 100) / totalDefenceValue;
        if (battleRatio > 100) battleRatio = 0;
        else battleRatio = 100 - battleRatio;
      }
      uint32 attackerRatio = 0;
      if (attackValues[i] > 0) {
        attackerRatio = (defendToward * 100) / attackValues[i];
        if (attackerRatio > 100) attackerRatio = 0;
        else attackerRatio = 100 - attackerRatio;
      }
      battleResult.attackerUnitsLeft[i] = (attackerRatio * attackerUnitCounts[i]) / 100;
      for (uint256 j = 0; j < defenderUnitCounts.length; j++) {
        battleResult.defenderUnitsLeft[j] += (defenderUnitCounts[j] * attackPercentage * battleRatio) / 10000;
      }
    }

    battleResult.winnerEntity = getWinner(world, battleEntity, battleResult);

    return battleResult;
  }

  function getWinner(
    IWorld world,
    uint256 battleEntity,
    BattleResult memory battleResult
  ) internal view returns (uint256 winner) {
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );

    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);

    if (
      getTotalRemainingAttack(world, battleEntity, battleResult.attackerUnitsLeft) >
      getTotalRemainingDefence(world, battleEntity, battleResult.defenderUnitsLeft)
    ) {
      winner = attacker.participantEntity;
    } else {
      winner = defender.participantEntity;
    }
    return winner;
  }

  function getTotalRemainingAttack(
    IWorld world,
    uint256 battleEntity,
    uint32[] memory attackerUnitsLeft
  ) internal view returns (uint32) {
    P_UnitAttackComponent unitAttackComponent = P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID));
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));

    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    uint32 totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      if (attackerUnitsLeft[i] <= 0) continue;
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(attacker.unitTypes[i], attacker.participantEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);
      totalAttackValue +=
        attackerUnitsLeft[i] *
        unitAttackComponent.getValue(LibEncode.hashKeyEntity(attacker.unitTypes[i], level));
    }
    return totalAttackValue;
  }

  function getTotalRemainingDefence(
    IWorld world,
    uint256 battleEntity,
    uint32[] memory defenderUnitsLeft
  ) internal view returns (uint32) {
    P_UnitDefenceComponent unitDefenceComponent = P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID));
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));

    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);
    uint32 totalDefenceValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      if (defenderUnitsLeft[i] <= 0) continue;
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(defender.unitTypes[i], defender.participantEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);
      totalDefenceValue +=
        defenderUnitsLeft[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(defender.unitTypes[i], level));
    }
    return totalDefenceValue;
  }

  function getTotalDefenceValue(IWorld world, uint256 battleEntity) internal view returns (uint32 totalDefenceValue) {
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_UnitDefenceComponent unitDefenceComponent = P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID));
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );
    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);
    totalDefenceValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      if (defender.unitCounts[i] <= 0) continue;
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(defender.unitTypes[i], defender.participantEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);
      totalDefenceValue +=
        defender.unitCounts[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(defender.unitTypes[i], level));
    }
    return totalDefenceValue;
  }

  function getTotalAttackValue(
    IWorld world,
    uint256 battleEntity
  ) internal view returns (uint32[] memory attackValues, uint32 totalAttackValue) {
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_UnitAttackComponent unitAttackComponent = P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID));
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    attackValues = new uint32[](attacker.unitTypes.length);
    totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      if (attacker.unitCounts[i] <= 0) continue;
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(attacker.unitTypes[i], attacker.participantEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);

      attackValues[i] =
        attacker.unitCounts[i] *
        unitAttackComponent.getValue(LibEncode.hashKeyEntity(attacker.unitTypes[i], level));
      totalAttackValue += attackValues[i];
    }

    return (attackValues, totalAttackValue);
  }
}
