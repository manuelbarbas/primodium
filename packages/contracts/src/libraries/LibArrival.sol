// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IWorld } from "solecs/System.sol";

// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { Trigonometry as Trig } from "trig/src/Trigonometry.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

// types
import { Coord, Dimensions, ESpaceRockType, Arrival } from "../types.sol";

library LibArrival {
  function applyArrivals(IWorld world, uint256 playerEntity, uint256 spaceRock) internal {
    uint256 playerSpaceRockEntity = LibEncode.hashKeyEntity(playerEntity, spaceRock);
    uint256 earliestEventBlock = block.number + 1;
    uint256 earliestEventIndex = 0;
    do {
      // max int
      earliestEventIndex = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
      uint256 listSize = ArrivalsList.length(world, playerSpaceRockEntity);
      if (listSize == 0) break;

      // get earliest event
      for (uint256 i = 0; i < listSize; i++) {
        uint256 arrivalBlock = ArrivalsList.getArrivalBlock(world, playerSpaceRockEntity, i);
        if (arrivalBlock <= earliestEventBlock) {
          earliestEventBlock = arrivalBlock;
          earliestEventIndex = i;
        }
      }

      if (earliestEventBlock > block.number) break;
      // apply arrival
      applyArrival(world, ArrivalsList.get(world, playerSpaceRockEntity, earliestEventIndex));
      ArrivalsList.remove(world, playerSpaceRockEntity, earliestEventIndex);
    } while (earliestEventBlock < block.number);
  }

  function applyArrival(IWorld world, Arrival memory arrival) internal pure {
    return;
  }
}
