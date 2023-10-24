// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "codegen/common.sol";
import { NUM_UNITS } from "src/constants.sol";
import { PositionData } from "codegen/index.sol";

struct Bounds {
  int32 minX;
  int32 minY;
  int32 maxX;
  int32 maxY;
}

struct Arrival {
  ESendType sendType;
  uint256 arrivalTime;
  uint256 sendTime;
  bytes32 from;
  bytes32 to;
  bytes32 origin;
  bytes32 destination;
  uint256[NUM_UNITS] unitCounts; // corresponds to EUnit: ["MiningVessel", "AegisDrone", "HammerDrone", "StingerDrone", "AnvilDrone"]
}

struct SendArgs {
  uint256[NUM_UNITS] unitCounts;
  ESendType sendType;
  PositionData originPosition;
  PositionData destinationPosition;
  bytes32 to;
}
