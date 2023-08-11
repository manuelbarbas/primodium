// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { VoxelCoord } from "std-contracts/components/VoxelCoordComponent.sol";
import { Coord } from "std-contracts/components/CoordComponent.sol";

struct ResourceValue {
  uint256 resource;
  uint32 value;
}

struct ResourceValues {
  uint256[] resources;
  uint32[] values;
}

enum EActionType {
  Build,
  Upgrade,
  Destroy
}
