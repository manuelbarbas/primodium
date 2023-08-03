// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.BuildingProduction"));

import { ResourceValue } from "../types.sol";

contract BuildingProductionComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "ResourceID";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "ResourceProductionRate";
    values[1] = LibTypes.SchemaValue.UINT32;
  }

  function set(uint256 entity, ResourceValue calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (ResourceValue memory) {
    (uint256 resourceID, uint32 resourceProductionRate) = abi.decode(getRawValue(entity), (uint256, uint32));
    return ResourceValue(resourceID, resourceProductionRate);
  }

  function getEntitiesWithValue(
    ResourceValue calldata factoryProductionData
  ) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(factoryProductionData));
  }
}
