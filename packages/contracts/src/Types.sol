// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "codegen/Types.sol";
import "codegen/Tables.sol";

struct Bounds {
  int32 minX;
  int32 minY;
  int32 maxX;
  int32 maxY;
}

struct ArrivalUnit {
  uint256 unitType;
  uint32 count;
}

struct Arrival {
  ESendType sendType;
  ArrivalUnit[] units;
  uint256 arrivalBlock;
  uint256 from;
  uint256 to;
  uint256 origin;
  uint256 destination;
}

struct SendArgs {
  ArrivalUnit[] arrivalUnits;
  ESendType sendType;
  PositionData originPosition;
  PositionData destinationPosition;
  uint256 to;
}
