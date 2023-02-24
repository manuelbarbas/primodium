// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct ResourceRow {
  uint256 resourceOwner;
  uint256 resourceType;
  uint256 resourceCount;
}

contract ResourceComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "resourceOwner";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "resourceType";
    values[1] = LibTypes.SchemaValue.UINT256;

    keys[2] = "resourceCount";
    values[2] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, ResourceRow calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (ResourceRow memory) {
    (uint256 resourceOwner, uint256 resourceType, uint256 resourceCount) = abi.decode(getRawValue(entity), (uint256, uint256, uint256));
    return ResourceRow(resourceOwner, resourceType, resourceCount);
  }

  function getEntitiesWithValue(ResourceRow calldata row) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(row));
  }
}