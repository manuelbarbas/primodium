// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "codegen/Types.sol";
import { PositionData } from "codegen/Tables.sol";

struct Bounds {
  int32 minX;
  int32 minY;
  int32 maxX;
  int32 maxY;
}

struct ArrivalUnit {
  EUnit unit;
  uint256 count;
}

struct Arrival {
  ESendType sendType;
  uint256 arrivalBlock;
  bytes32 from;
  bytes32 to;
  bytes32 origin;
  bytes32 destination;
  uint256[] unitCounts;
  bytes32[] unitTypes;
}

struct SendArgs {
  ArrivalUnit[] arrivalUnits;
  ESendType sendType;
  PositionData originPosition;
  PositionData destinationPosition;
  bytes32 to;
}
