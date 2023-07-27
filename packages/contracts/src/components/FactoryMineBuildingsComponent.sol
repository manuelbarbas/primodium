// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { ResourceValues } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.FactoryMineBuildings"));

contract FactoryMineBuildingsComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "resources";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "values";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, ResourceValues calldata value) public virtual {
    set(entity, abi.encode(value.resources, value.values));
  }

  function getValue(uint256 entity) public view virtual returns (ResourceValues memory) {
    (uint256[] memory mineIds, uint32[] memory mineCounts) = abi.decode(getRawValue(entity), (uint256[], uint32[]));
    return ResourceValues(mineIds, mineCounts);
  }

  function getEntitiesWithValue(ResourceValues calldata mines) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(mines));
  }
}
