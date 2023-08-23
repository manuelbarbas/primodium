// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, entityToAddress } from "solecs/utils.sol";
// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

//interfaces
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

//systems
import { S_ResolveBattleSystem, ID as S_ResolveBattleSystemID } from "systems/S_ResolveBattleSystem.sol";

import "forge-std/console.sol";
// comps

import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
import { BattleSpaceRockComponent, ID as BattleSpaceRockComponentID } from "components/BattleSpaceRockComponent.sol";
import { BattleDefenderComponent, ID as BattleDefenderComponentID } from "components/BattleDefenderComponent.sol";
import { BattleAttackerComponent, ID as BattleAttackerComponentID } from "components/BattleAttackerComponent.sol";
import { BattleResultComponent, ID as BattleResultComponentID } from "components/BattleResultComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
// types
import { Coord, Arrival, ArrivalUnit, BattleParticipant, ESendType, BattleResult } from "src/types.sol";

library LibInvade {
  function invade(IWorld world, uint256 invader, uint256 rockEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    uint256 battleEntity = LibEncode.hashKeyEntity(rockEntity, block.number);
    BattleSpaceRockComponent(world.getComponent(BattleSpaceRockComponentID)).set(battleEntity, rockEntity);
    setupBattleAttacker(world, battleEntity, invader, rockEntity);
    console.log("setup attacker");
    uint256 defenderEntity = 0;
    if (ownedByComponent.has(rockEntity)) {
      require(ownedByComponent.getValue(rockEntity) != invader, "[Invade]: can not invade your own rock");
      defenderEntity = ownedByComponent.getValue(rockEntity);
    } else {
      BattleParticipant memory attacker = BattleAttackerComponent(world.getComponent(BattleAttackerComponentID))
        .getValue(battleEntity);
      for (uint i = 0; i < attacker.unitTypes.length; i++) {
        LibUpdateSpaceRock.addUnitsToAsteroid(
          world,
          invader,
          rockEntity,
          attacker.unitTypes[i],
          attacker.unitCounts[i]
        );
      }
      return;
    }
    setupBattleDefender(world, battleEntity, defenderEntity, rockEntity);
    console.log("setup defender");
    IOnEntitySubsystem(getAddressById(world.systems(), S_ResolveBattleSystemID)).executeTyped(
      entityToAddress(invader),
      battleEntity
    );
    console.log("resolve battle");
    updatePlayerUnitsAfterBattle(world, battleEntity, rockEntity);
    console.log("update units after battle");
    uint256 winnerEntity = BattleResultComponent(world.getComponent(BattleResultComponentID))
      .getValue(battleEntity)
      .winnerEntity;
    if (ownedByComponent.has(rockEntity) && ownedByComponent.getValue(rockEntity) != winnerEntity) {
      LibReinforce.recallAllReinforcements(world, rockEntity);
    }
    ownedByComponent.set(rockEntity, winnerEntity);
    console.log("ownership updated after battle");
    //ArrivalsList.get(world, playerAsteroidEntity, arrival);
  }

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

  function setupBattleAttacker(IWorld world, uint256 battleEntity, uint256 attackerEntity, uint256 spaceRock) internal {
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
      console.log("while loop index: %s , size: %s", index, size);
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);
      console.log("while loop after get index: %s , size: %s", index, size);
      if (arrival.sendType != ESendType.INVADE) {
        index++;
        console.log("while loop not invade increment index: %s , size: %s", index, size);
        continue;
      }
      if (arrival.arrivalBlock <= block.number) {
        console.log("arrival reached add units index %s", index);
        for (uint i = 0; i < arrival.units.length; i++) {
          attacker.unitCounts[i] += arrival.units[i].count;
        }
        console.log("try to remove arrival at %s", index);
        ArrivalsList.remove(world, playerAsteroidEntity, index);
        console.log("removed arrival at %s", index);
        size--;
      } else {
        console.log("while loop invade not reached yet increment index: %s , size: %s", index, size);
        index++;
      }
      console.log("while loop end of loop index: %s , size: %s", index, size);
    }
    console.log("while loop exit index: %s , size: %s", index, size);
    battleAttackerComponent.set(battleEntity, attacker);
  }

  function updatePlayerUnitsAfterBattle(IWorld world, uint256 battleEntity, uint256 rockEntity) internal {
    BattleResult memory battleResult = BattleResultComponent(world.getComponent(BattleResultComponentID)).getValue(
      battleEntity
    );
    BattleParticipant memory attacker = BattleAttackerComponent(world.getComponent(BattleAttackerComponentID)).getValue(
      battleEntity
    );
    BattleParticipant memory defender = BattleDefenderComponent(world.getComponent(BattleDefenderComponentID)).getValue(
      battleEntity
    );

    uint256 loserEntity = battleResult.winnerEntity == attacker.participantEntity
      ? defender.participantEntity
      : attacker.participantEntity;
    uint256[] memory unitTypes = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID)).getEntitiesWithValue(true);
    if (attacker.participantEntity == battleResult.winnerEntity) {
      LibUpdateSpaceRock.destroyAllPlayerUnitsOnAsteroid(world, loserEntity, rockEntity);
      for (uint i = 0; i < battleResult.attackerUnitsLeft.length; i++) {
        if (attacker.unitCounts[i] <= 0) continue;
        LibUnits.updateOccuppiedUtilityResources(
          world,
          attacker.participantEntity,
          unitTypes[i],
          attacker.unitCounts[i] - battleResult.attackerUnitsLeft[i],
          false
        );
        LibUpdateSpaceRock.setUnitsOnAsteroid(
          world,
          attacker.participantEntity,
          rockEntity,
          unitTypes[i],
          battleResult.attackerUnitsLeft[i]
        );
      }
    } else {
      for (uint i = 0; i < unitTypes.length; i++) {
        if (attacker.unitCounts[i] > 0)
          LibUnits.updateOccuppiedUtilityResources(
            world,
            attacker.participantEntity,
            unitTypes[i],
            attacker.unitCounts[i],
            false
          );
        if (defender.unitCounts[i] <= 0) continue;
        LibUnits.updateOccuppiedUtilityResources(
          world,
          attacker.participantEntity,
          unitTypes[i],
          defender.unitCounts[i] - battleResult.defenderUnitsLeft[i],
          false
        );
        LibUpdateSpaceRock.setUnitsOnAsteroid(
          world,
          battleResult.winnerEntity,
          rockEntity,
          unitTypes[i],
          battleResult.defenderUnitsLeft[i]
        );
      }
    }
  }
}
