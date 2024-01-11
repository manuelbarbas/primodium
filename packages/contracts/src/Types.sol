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

// struct FleetStatus
// {
//   PositionData origin,
//   PositionData destination,
//   uint256 arrivalTime;
//   uint256 sendTime;
//   uint256 resourceStorage;
//   uint256 occuppiedStorage;
// }
