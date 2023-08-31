// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps

import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
// types
import { Coord, Arrival, ArrivalUnit, ESendType } from "src/types.sol";

library LibReinforce {
  function receiveReinforcements(IWorld world, uint256 receiver, uint256 rockEntity) internal {
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(receiver, rockEntity);
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    require(
      ownedByComponent.has(rockEntity),
      "[Reinforcement]: request reinforcement can not be done on a rock that is not owned"
    );
    require(
      ownedByComponent.getValue(rockEntity) == receiver,
      "[Reinforcement]: only the owner of a rock can receive reinforcements"
    );

    uint256 size = LibMath.getSafe(
      ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)),
      playerAsteroidEntity
    );
    uint256 index = 0;
    while (index < size) {
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);
      if (arrival.sendType != ESendType.REINFORCE || arrival.to != receiver) {
        index++;
        continue;
      }
      if (arrival.arrivalBlock <= block.number) {
        if (!receiveReinforcementsFromArrival(world, receiver, rockEntity, index)) index++;
        else size -= 1;
      }
    }
    //ArrivalsList.get(world, playerAsteroidEntity, arrival);
  }

  // will return true if the arrival is resolved
  function receiveReinforcementsFromArrival(
    IWorld world,
    uint256 playerEntity,
    uint256 asteroidEntity,
    uint256 arrivalIndex
  ) internal returns (bool) {
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(playerEntity, asteroidEntity);
    Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, arrivalIndex);
    bool isArrivalResolved = true;
    for (uint i = 0; i < arrival.units.length; i++) {
      if (arrival.units[i].count == 0) continue;
      uint32 num = LibMath.min(
        LibUnits.howManyUnitsCanAdd(world, playerEntity, arrival.units[i].unitType),
        arrival.units[i].count
      );
      if (num > 0) {
        LibUpdateSpaceRock.addUnitsToAsteroid(world, playerEntity, asteroidEntity, arrival.units[i].unitType, num);
        LibUnits.updateOccuppiedUtilityResources(world, playerEntity, arrival.units[i].unitType, num, true);

        arrival.units[i].count -= num;

        LibUnits.updateOccuppiedUtilityResources(world, arrival.from, arrival.units[i].unitType, num, false);
      }
      if (arrival.units[i].count > 0) {
        isArrivalResolved = false;
      }
    }
    if (isArrivalResolved) {
      LibMath.subtract(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), arrival.from, 1);
      ArrivalsList.remove(world, playerAsteroidEntity, arrivalIndex);
      return true;
    } else {
      ArrivalsList.set(world, playerAsteroidEntity, arrivalIndex, arrival);
      return false;
    }
  }

  function recallReinforcements(IWorld world, uint256 recallerEntity, uint256 rockEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    require(
      ownedByComponent.has(rockEntity),
      "[Reinforcement]: request reinforcement can not be done on a rock that is not owned"
    );
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(ownedByComponent.getValue(rockEntity), rockEntity);
    uint256 size = LibMath.getSafe(
      ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)),
      playerAsteroidEntity
    );
    uint256 index = 0;
    uint256 homeAsteroidEntity = LibEncode.hashEntity(world, recallerEntity);
    while (index < size) {
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);
      if (
        arrival.sendType != ESendType.REINFORCE || arrival.from != recallerEntity || arrival.arrivalBlock > block.number
      ) {
        index++;
        continue;
      }
      for (uint i = 0; i < arrival.units.length; i++) {
        if (arrival.units[i].count == 0) continue;
        LibUpdateSpaceRock.addUnitsToAsteroid(
          world,
          recallerEntity,
          homeAsteroidEntity,
          arrival.units[i].unitType,
          arrival.units[i].count
        );
      }
      LibMath.subtract(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), recallerEntity, 1);
      ArrivalsList.remove(world, playerAsteroidEntity, index);
      size -= 1;
    }
  }

  function recallAllReinforcements(IWorld world, uint256 rockEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    if (!ownedByComponent.has(rockEntity)) return;
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(ownedByComponent.getValue(rockEntity), rockEntity);
    uint256 size = LibMath.getSafe(
      ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)),
      playerAsteroidEntity
    );

    uint256 index = 0;
    while (index < size) {
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);
      if (arrival.sendType != ESendType.REINFORCE) {
        index++;
        continue;
      }
      uint256 homeAsteroidEntity = LibEncode.hashEntity(world, arrival.from);
      for (uint i = 0; i < arrival.units.length; i++) {
        if (arrival.units[i].count == 0) continue;
        LibUpdateSpaceRock.addUnitsToAsteroid(
          world,
          arrival.from,
          homeAsteroidEntity,
          arrival.units[i].unitType,
          arrival.units[i].count
        );
      }
      ArrivalsList.remove(world, playerAsteroidEntity, index);
      LibMath.subtract(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), arrival.from, 1);
      size -= 1;
    }
  }
}
