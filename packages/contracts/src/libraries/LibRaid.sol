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
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibReinforce } from "libraries/LibReinforce.sol";
import { LibBattle } from "libraries/LibBattle.sol";
// types
import { Coord, Arrival, ArrivalUnit, BattleParticipant, ESendType, BattleResult, ESpaceRockType } from "src/types.sol";

library LibRaid {
  function raid(IWorld world, uint256 invader, uint256 rockEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    uint256 battleEntity = LibEncode.hashKeyEntity(rockEntity, block.number);
    BattleSpaceRockComponent(world.getComponent(BattleSpaceRockComponentID)).set(battleEntity, rockEntity);
    require(
      AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID)).getValue(rockEntity) ==
        ESpaceRockType.ASTEROID,
      "LibRaid: can only raid asteroids"
    );
    LibBattle.setupBattleAttacker(world, battleEntity, invader, rockEntity, ESendType.RAID);
    console.log("setup attacker");
    uint256 defenderEntity = 0;
    if (ownedByComponent.has(rockEntity)) {
      require(ownedByComponent.getValue(rockEntity) != invader, "[Raid]: can not raid your own rock");
      defenderEntity = ownedByComponent.getValue(rockEntity);
    } else {
      revert("LibRaid: can not raid unowned rock");
    }
    LibBattle.setupBattleDefender(world, battleEntity, defenderEntity, rockEntity);
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
    uint256 attackerHomeAsteroid = LibEncode.hashEntity(world, attacker.participantEntity);

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
          attackerHomeAsteroid,
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
