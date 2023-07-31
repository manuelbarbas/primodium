// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import "std-contracts/components/Uint256Component.sol";

import { ResourceValue } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.PassiveProduction"));

contract PassiveProductionComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "ResourceID";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "ResourceProduction";
    values[1] = LibTypes.SchemaValue.UINT32;
  }

  function set(uint256 entity, ResourceValue calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (ResourceValue memory) {
    (uint256 resourceID, uint32 resourceProduction) = abi.decode(getRawValue(entity), (uint256, uint32));
    return ResourceValue(resourceID, resourceProduction);
  }

  function getEntitiesWithValue(ResourceValue calldata resourceValue) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(resourceValue));
  }
}
