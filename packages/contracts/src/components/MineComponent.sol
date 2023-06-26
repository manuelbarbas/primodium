// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct MineData {
  uint256 MineCountPerBlock;
  uint256 MineCountMax;
}

contract MineComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "MineCountPerBlock";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "MineCountMax";
    values[1] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, MineData calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (MineData memory) {
    (uint256 MineCountPerBlock, uint256 MineCountMax) = abi.decode(getRawValue(entity), (uint256, uint256));
    return MineData(MineCountPerBlock, MineCountMax);
  }

  function getEntitiesWithValue(MineData calldata coord) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
