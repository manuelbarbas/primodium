// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Coord {
  int256 x;
  int256 y;
}

contract CoordComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT256;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT256;
  }

  function set(uint256 entity, Coord calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (Coord memory) {
    (int256 x, int256 y) = abi.decode(getRawValue(entity), (int256, int256));
    return Coord(x, y);
  }

  function getEntitiesWithValue(Coord calldata coord) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
