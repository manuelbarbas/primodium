// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { addressToEntity } from "solecs/utils.sol";

// comps

import { ArrivalComponent, ID as ArrivalComponentID } from "components/ArrivalComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";

// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

// types
import { ESendType, Coord, Arrival, ArrivalUnit } from "src/types.sol";

library LibSend {
  function sendUnits(IWorld world, Arrival memory arrival) internal {
    uint256 playerAsteroidEntity = LibEncode.hashKeyEntity(arrival.from, arrival.destination);
    ArrivalsList.add(world, playerAsteroidEntity, arrival);
  }

  function distance(Coord memory a, Coord memory b) public pure returns (uint32) {
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

  function updatePlayerSpaceRock(IWorld world, uint256 playerEntity, uint256 spaceRock) internal {
    uint256 playerSpaceRockEntity = LibEncode.hashKeyEntity(playerEntity, spaceRock);
    uint256 earliestEventBlock = block.number;
    uint256 earliestEventIndex = 0;
    do {
      earliestEventIndex = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
      uint256 listSize = ArrivalsList.length(world, playerSpaceRockEntity);
      if (listSize == 0) break;

      // get earliest event
      for (uint256 i = 0; i < listSize; i++) {
        uint256 arrivalBlock = ArrivalsList.getArrivalBlock(world, playerSpaceRockEntity, i);
        if (arrivalBlock < earliestEventBlock) {
          earliestEventBlock = arrivalBlock;
          earliestEventIndex = i;
        }
      }

      if (earliestEventBlock >= block.number) break;
      // claim units
      LibUnits.claimUnits(world, playerEntity, earliestEventBlock);
      // apply arrival
      applyArrival(world, ArrivalsList.get(world, playerSpaceRockEntity, earliestEventIndex));
      ArrivalsList.remove(world, playerSpaceRockEntity, earliestEventIndex);
    } while (earliestEventBlock < block.number);
  }

  function applyArrival(IWorld world, Arrival memory arrival) public {
    UnitsComponent unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
    if (arrival.sendType == ESendType.REINFORCE) {
      for (uint i = 0; i < arrival.units.length; i++) {
        uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(
          uint256(arrival.units[i].unitType),
          arrival.to,
          arrival.destination
        );
        LibMath.add(unitsComponent, unitPlayerSpaceRockEntity, arrival.units[i].count);
      }
    } else {
      revert("LibSend: unimplemented");
    }
  }
}
