// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { addressToEntity } from "solecs/utils.sol";
//components
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { P_UnitAttackComponent, ID as P_UnitAttackComponentID } from "components/P_UnitAttackComponent.sol";
import { P_UnitDefenceComponent, ID as P_UnitDefenceComponentID } from "components/P_UnitDefenceComponent.sol";
import { P_UnitCargoComponent, ID as P_UnitCargoComponentID } from "components/P_UnitCargoComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { BattleAttackerComponent, ID as BattleAttackerComponentID } from "components/BattleAttackerComponent.sol";
import { BattleDefenderComponent, ID as BattleDefenderComponentID } from "components/BattleDefenderComponent.sol";
import { BattleResult, BattleParticipant } from "../types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";

library LibBattle {
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
      uint32 attackPercentage = (attackValues[i] * 100) / totalAttackValue;
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

    battleResult.winnerAddress = getWinner(world, battleEntity, battleResult);

    return battleResult;
  }

  function getWinner(
    IWorld world,
    uint256 battleEntity,
    BattleResult memory battleResult
  ) internal view returns (address winner) {
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
      winner = attacker.playerAddress;
    } else {
      winner = defender.playerAddress;
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
    uint256 attackerEntity = addressToEntity(attacker.playerAddress);
    uint32 totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(attacker.unitTypes[i], attackerEntity);
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
    uint256 defenderEntity = addressToEntity(defender.playerAddress);
    uint32 totalAttackValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(defender.unitTypes[i], defenderEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);
      totalAttackValue +=
        defenderUnitsLeft[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(defender.unitTypes[i], level));
    }
    return totalAttackValue;
  }

  function getTotalDefenceValue(IWorld world, uint256 battleEntity) internal view returns (uint32 totalDefenceValue) {
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_UnitDefenceComponent unitDefenceComponent = P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID));
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );
    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);
    uint256 defenderEntity = addressToEntity(defender.playerAddress);
    totalDefenceValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(defender.unitTypes[i], defenderEntity);
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
    P_UnitAttackComponent unitDefenceComponent = P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID));
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    uint256 attackerEntity = addressToEntity(attacker.playerAddress);
    attackValues = new uint32[](attacker.unitTypes.length);
    totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(attacker.unitTypes[i], attackerEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);

      attackValues[i] =
        attacker.unitCounts[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(attacker.unitTypes[i], level));
      totalAttackValue += attackValues[i];
    }

    return (attackValues, totalAttackValue);
  }

  function getTotalCargoValue(IWorld world, uint256 battleEntity) internal view returns (uint32 totalCargoValue) {
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_UnitCargoComponent unitCargoComponent = P_UnitCargoComponent(world.getComponent(P_UnitCargoComponentID));
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    uint256 attackerEntity = addressToEntity(attacker.playerAddress);

    totalCargoValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      uint256 playerUnitEntity = LibEncode.hashKeyEntity(attacker.unitTypes[i], attackerEntity);
      uint32 level = levelComponent.getValue(playerUnitEntity);

      totalCargoValue +=
        attacker.unitCounts[i] *
        unitCargoComponent.getValue(LibEncode.hashKeyEntity(attacker.unitTypes[i], level));
    }

    return totalCargoValue;
  }

  function max(uint32 num1, uint32 num2) internal pure returns (uint32) {
    return num1 > num2 ? num1 : num2;
  }

  function resolveRaid(IWorld world, uint256 battleEntity) internal {
    uint32 totalCargo = getTotalCargoValue(world, battleEntity);

    if (totalCargo == 0) return;

    BattleParticipant memory defender = BattleDefenderComponent(world.getComponent(BattleDefenderComponentID)).getValue(
      battleEntity
    );
    uint256 defenderEntity = addressToEntity(defender.playerAddress);

    (uint32 totalResources, uint32[] memory resources) = LibResource.getTotalResources(
      world,
      addressToEntity(defender.playerAddress)
    );
    if (totalResources == 0) return;

    LibResource.claimAllResources(
      world,
      addressToEntity(
        BattleAttackerComponent(world.getComponent(BattleAttackerComponentID)).getValue(battleEntity).playerAddress
      )
    );
    LibResource.claimAllResources(
      world,
      addressToEntity(
        BattleDefenderComponent(world.getComponent(BattleDefenderComponentID)).getValue(battleEntity).playerAddress
      )
    );

    BattleParticipant memory attacker = BattleAttackerComponent(world.getComponent(BattleAttackerComponentID)).getValue(
      battleEntity
    );
    uint256 attackerEntity = addressToEntity(attacker.playerAddress);

    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    uint256[] memory resourceIds = P_MaxResourceStorageComponent(world.getComponent(P_MaxResourceStorageComponentID))
      .getValue(defenderEntity);

    for (uint256 i = 0; i < resources.length; i++) {
      uint32 raidAmount = (totalCargo * resources[i]) / totalResources;

      if (resources[i] >= raidAmount) resources[i] = resources[i] - raidAmount;
      else {
        raidAmount = resources[i];
        resources[i] = 0;
      }
      LibStorage.addResourceToStorage(world, resourceIds[i], raidAmount, attackerEntity);

      itemComponent.set(LibEncode.hashKeyEntity(resourceIds[i], defenderEntity), resources[i]);
    }
  }
}
