// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.Position"));

contract PositionComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "parent";
    values[2] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, Coord calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function set(uint256 entity, int32 x, int32 y, uint256 parent) public virtual {
    set(entity, abi.encode(Coord(x, y, parent)));
  }

  function getValue(uint256 entity) public view virtual returns (Coord memory) {
    (int32 x, int32 y, uint256 parent) = abi.decode(getRawValue(entity), (int32, int32, uint256));
    return Coord(x, y, parent);
  }

  function getEntitiesWithValue(Coord calldata coord) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
