// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct FactoryMineBuildingsData {
  uint256[] MineBuildingIDs;
  uint256[] MineBuildingCount;
}
uint256 constant ID = uint256(keccak256("component.FactoryMineBuildings"));

contract FactoryMineBuildingsComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "MineBuildingIDs";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "MineBuildingCount";
    values[1] = LibTypes.SchemaValue.UINT256_ARRAY;
  }

  function set(uint256 entity, FactoryMineBuildingsData calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (FactoryMineBuildingsData memory) {
    (uint256[] memory mineBuildingIDs, uint256[] memory mineBuildingCount) = abi.decode(
      getRawValue(entity),
      (uint256[], uint256[])
    );
    return FactoryMineBuildingsData(mineBuildingIDs, mineBuildingCount);
  }

  function getEntitiesWithValue(
    FactoryMineBuildingsData calldata factoryMineBuildingsData
  ) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(factoryMineBuildingsData));
  }
}
