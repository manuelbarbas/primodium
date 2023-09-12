// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { ResourceValues } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.P_UnitReward"));

contract P_UnitRewardComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "resourceIDs";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "requiredAmounts";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, ResourceValues calldata resourceValues) public virtual {
    set(entity, abi.encode(resourceValues.resources, resourceValues.values));
  }

  function getValue(uint256 entity) public view virtual returns (ResourceValues memory) {
    (uint256[] memory resourceIDs, uint32[] memory requiredAmounts) = abi.decode(
      getRawValue(entity),
      (uint256[], uint32[])
    );
    return ResourceValues(resourceIDs, requiredAmounts);
  }

  function getEntitiesWithValue(ResourceValues calldata resources) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(resources));
  }
}
