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

    uint256 size = LibMath.getSafe(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), receiver);
    uint256 index = 0;
    while (index < size) {
      Arrival memory arrival = ArrivalsList.get(world, playerAsteroidEntity, index);
      if (arrival.sendType == ESendType.REINFORCE) continue;
      if (arrival.to != receiver) continue;
      if (arrival.arrivalBlock <= block.number) {
        if (!receiveReinforcementsFromArrival(world, index, receiver, rockEntity)) index++;
        else size -= 1;
      }
    }
    //ArrivalsList.get(world, playerAsteroidEntity, arrival);
  }

  // will return true if the arrival is resolved
  function receiveReinforcementsFromArrival(
    IWorld world,
    uint256 arrivalIndex,
    uint256 playerEntity,
    uint256 asteroidEntity
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
        arrival.units[i].count -= num;
        LibUnits.updateOccuppiedUtilityResources(world, arrival.from, arrival.units[i].unitType, num, false);
      }
      if (arrival.units[i].count > 0) {
        isArrivalResolved = false;
      }
    }
    if (isArrivalResolved) {
      ArrivalsList.remove(world, playerAsteroidEntity, arrivalIndex);
      return true;
    } else {
      ArrivalsList.set(world, playerAsteroidEntity, arrivalIndex, arrival);
      return false;
    }
  }

  function distance(Coord memory a, Coord memory b) internal pure returns (uint32) {
    int128 distanceSquared = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    return uint32(Math.toUInt(Math.sqrt(Math.fromInt(distanceSquared))));
  }

  function getSlowestUnitSpeed(
    IWorld world,
    ArrivalUnit[] memory arrivalUnits
  ) internal view returns (uint256 slowestSpeed) {
    require(arrivalUnits.length > 0, "LibSend: arrivalUnits length must be greater than 0");
    SpeedComponent speedComponent = SpeedComponent(world.getComponent(SpeedComponentID));
    slowestSpeed = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    for (uint i = 0; i < arrivalUnits.length; i++) {
      uint256 unitType = uint256(arrivalUnits[i].unitType);
      require(speedComponent.has(unitType), "LibSend: unit type does not have speed component");
      uint256 currSpeed = speedComponent.getValue(unitType);
      if (currSpeed < slowestSpeed) {
        slowestSpeed = currSpeed;
      }
    }
  }
}
