// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";
import { addressToEntity } from "solecs/utils.sol";
//components
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
import { TotalUnitsDestroyedComponent, ID as TotalUnitsDestroyedComponentID } from "components/TotalUnitsDestroyedComponent.sol";
import { P_DestroyedUnitsRequirementComponent, ID as P_DestroyedUnitsRequirementComponentID } from "components/P_DestroyedUnitsRequirementComponent.sol";
import { PirateComponent, ID as PirateComponentID } from "components/PirateComponent.sol";
import { P_SpawnPirateAsteroidComponent, ID as P_SpawnPirateAsteroidComponentID } from "components/P_SpawnPirateAsteroidComponent.sol";
import { DefeatedSpawnedPirateAsteroidComponent, ID as DefeatedSpawnedPirateAsteroidComponentID } from "components/DefeatedSpawnedPirateAsteroidComponent.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibUnits } from "./LibUnits.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { ResourceValues } from "../types.sol";

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
          for (uint j = 0; j < attacker.unitTypes.length; j++) {
            if (arrival.units[i].unitType == attacker.unitTypes[j]) {
              attacker.unitCounts[j] += arrival.units[i].count;
              break;
            }
          }
        }
        ArrivalsList.remove(world, playerAsteroidEntity, index);
        LibMath.subtract(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), attackerEntity, 1);
        size--;
      } else {
        index++;
      }
    }
    battleAttackerComponent.set(battleEntity, attacker);
  }

  function resolveBattle(IWorld world, uint256 battleEntity) internal returns (BattleResult memory) {
    BattleResult memory battleResult;

    BattleParticipant memory attacker = BattleAttackerComponent(world.getComponent(BattleAttackerComponentID)).getValue(
      battleEntity
    );

    BattleParticipant memory defender = BattleDefenderComponent(world.getComponent(BattleDefenderComponentID)).getValue(
      battleEntity
    );

    battleResult.attackerUnitsLeft = new uint32[](attacker.unitCounts.length);
    battleResult.defenderUnitsLeft = new uint32[](defender.unitCounts.length);

    uint32 totalAttackValue = getTotalAttackValue(world, battleEntity);
    uint32 totalDefenceValue = getTotalDefenceValue(world, battleEntity);
    bool isAttackerWinner = totalAttackValue > totalDefenceValue;

    battleResult.winnerEntity = isAttackerWinner ? attacker.participantEntity : defender.participantEntity;
    TotalUnitsDestroyedComponent totalUnitsDestroyedComponent = TotalUnitsDestroyedComponent(
      world.getComponent(TotalUnitsDestroyedComponentID)
    );
    uint32 lossRatio;
    if (isAttackerWinner) {
      for (uint256 i = 0; i < defender.unitTypes.length; i++) {
        LibMath.add(
          totalUnitsDestroyedComponent,
          LibEncode.hashKeyEntity(defender.unitTypes[i], attacker.participantEntity),
          defender.unitCounts[i]
        );
      }
      lossRatio = 100 - ((totalDefenceValue * 100) / totalAttackValue);
      for (uint256 i = 0; i < attacker.unitCounts.length; i++) {
        battleResult.attackerUnitsLeft[i] = (attacker.unitCounts[i] * lossRatio) / 100;
        LibMath.add(
          totalUnitsDestroyedComponent,
          LibEncode.hashKeyEntity(attacker.unitTypes[i], defender.participantEntity),
          attacker.unitCounts[i] - battleResult.attackerUnitsLeft[i]
        );
      }
    } else {
      lossRatio = 100 - ((totalAttackValue * 100) / totalDefenceValue);
      for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
        LibMath.add(
          totalUnitsDestroyedComponent,
          LibEncode.hashKeyEntity(attacker.unitTypes[i], defender.participantEntity),
          attacker.unitCounts[i]
        );
      }
      for (uint256 i = 0; i < defender.unitCounts.length; i++) {
        battleResult.defenderUnitsLeft[i] = (defender.unitCounts[i] * lossRatio) / 100;
        LibMath.add(
          totalUnitsDestroyedComponent,
          LibEncode.hashKeyEntity(defender.unitTypes[i], attacker.participantEntity),
          defender.unitCounts[i] - battleResult.defenderUnitsLeft[i]
        );
      }
    }
    PirateComponent pirateComponent = PirateComponent(world.getComponent(PirateComponentID));
    uint256 defenderHomeAsteroid = LibUpdateSpaceRock.getPlayerAsteroidEntity(world, defender.participantEntity);
    if (pirateComponent.has(defenderHomeAsteroid)) {
      DefeatedSpawnedPirateAsteroidComponent defeatedSpawnedPirateAsteroidComponent = DefeatedSpawnedPirateAsteroidComponent(
          world.getComponent(DefeatedSpawnedPirateAsteroidComponentID)
        );
      P_SpawnPirateAsteroidComponent spawnPirateAsteroidComponent = P_SpawnPirateAsteroidComponent(
        world.getComponent(P_SpawnPirateAsteroidComponentID)
      );
      defeatedSpawnedPirateAsteroidComponent.set(
        LibEncode.hashKeyEntity(spawnPirateAsteroidComponent.getValue(defenderHomeAsteroid), attacker.participantEntity)
      );
    }
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
    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);
    uint32 totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      if (attackerUnitsLeft[i] <= 0) continue;
      uint32 level = LibUnits.getPlayerUnitTypeLevel(world, attacker.participantEntity, attacker.unitTypes[i]);
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

    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);
    uint32 totalDefenceValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      if (defenderUnitsLeft[i] <= 0) continue;
      uint32 level = LibUnits.getPlayerUnitTypeLevel(world, defender.participantEntity, defender.unitTypes[i]);
      totalDefenceValue +=
        defenderUnitsLeft[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(defender.unitTypes[i], level));
    }
    return totalDefenceValue;
  }

  function getTotalDefenceValue(IWorld world, uint256 battleEntity) internal view returns (uint32 totalDefenceValue) {
    P_UnitDefenceComponent unitDefenceComponent = P_UnitDefenceComponent(world.getComponent(P_UnitDefenceComponentID));
    BattleDefenderComponent battleDefenderComponent = BattleDefenderComponent(
      world.getComponent(BattleDefenderComponentID)
    );
    BattleParticipant memory defender = battleDefenderComponent.getValue(battleEntity);
    totalDefenceValue = 0;
    for (uint256 i = 0; i < defender.unitTypes.length; i++) {
      if (defender.unitCounts[i] <= 0) continue;
      uint32 level = LibUnits.getPlayerUnitTypeLevel(world, defender.participantEntity, defender.unitTypes[i]);
      totalDefenceValue +=
        defender.unitCounts[i] *
        unitDefenceComponent.getValue(LibEncode.hashKeyEntity(defender.unitTypes[i], level));
    }
    return totalDefenceValue;
  }

  function getTotalAttackValue(IWorld world, uint256 battleEntity) internal view returns (uint32 totalAttackValue) {
    P_UnitAttackComponent unitAttackComponent = P_UnitAttackComponent(world.getComponent(P_UnitAttackComponentID));
    BattleAttackerComponent battleAttackerComponent = BattleAttackerComponent(
      world.getComponent(BattleAttackerComponentID)
    );
    BattleParticipant memory attacker = battleAttackerComponent.getValue(battleEntity);

    totalAttackValue = 0;
    for (uint256 i = 0; i < attacker.unitTypes.length; i++) {
      if (attacker.unitCounts[i] <= 0) continue;
      uint32 level = LibUnits.getPlayerUnitTypeLevel(world, attacker.participantEntity, attacker.unitTypes[i]);
      totalAttackValue +=
        attacker.unitCounts[i] *
        unitAttackComponent.getValue(LibEncode.hashKeyEntity(attacker.unitTypes[i], level));
    }

    return (totalAttackValue);
  }

  function checkDestroyedUnitsRequirement(
    IWorld world,
    uint256 playerEntity,
    uint256 objectiveEntity
  ) internal view returns (bool) {
    P_DestroyedUnitsRequirementComponent destroyedUnitsRequirementComponent = P_DestroyedUnitsRequirementComponent(
      world.getComponent(P_DestroyedUnitsRequirementComponentID)
    );
    if (!destroyedUnitsRequirementComponent.has(objectiveEntity)) return true;
    TotalUnitsDestroyedComponent totalUnitsDestroyedComponent = TotalUnitsDestroyedComponent(
      world.getComponent(TotalUnitsDestroyedComponentID)
    );
    ResourceValues memory destroyedUnitsRequirements = destroyedUnitsRequirementComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < destroyedUnitsRequirements.resources.length; i++) {
      if (
        LibMath.getSafe(
          totalUnitsDestroyedComponent,
          LibEncode.hashKeyEntity(destroyedUnitsRequirements.resources[i], playerEntity)
        ) < destroyedUnitsRequirements.values[i]
      ) {
        return false;
      }
    }
    return true;
  }
}
