// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct MinesData {
  uint256[] MineBuildingIDs;
  uint32[] MineBuildingCount;
}
uint256 constant ID = uint256(keccak256("component.Mines"));

contract MinesComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "MineBuildingIDs";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "MineBuildingCount";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, MinesData calldata value) public virtual {
    set(entity, abi.encode(value.MineBuildingIDs, value.MineBuildingCount));
  }

  function getValue(uint256 entity) public view virtual returns (MinesData memory) {
    (uint256[] memory mineBuildingIDs, uint32[] memory mineBuildingCount) = abi.decode(
      getRawValue(entity),
      (uint256[], uint32[])
    );
    return MinesData(mineBuildingIDs, mineBuildingCount);
  }

  function getEntitiesWithValue(MinesData calldata minesData) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(minesData));
  }
}
