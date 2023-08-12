// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { Dimensions } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.Dimensions"));

contract DimensionsComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "width";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "height";
    values[1] = LibTypes.SchemaValue.INT32;
  }

  function set(uint256 entity, Dimensions calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function set(uint256 entity, int32 width, int32 height) public virtual {
    set(entity, abi.encode(Dimensions(width, height)));
  }

  function getValue(uint256 entity) public view virtual returns (Dimensions memory) {
    (int32 width, int32 height) = abi.decode(getRawValue(entity), (int32, int32));
    return Dimensions(width, height);
  }

  function getEntitiesWithValue(Dimensions calldata size) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(size));
  }
}
