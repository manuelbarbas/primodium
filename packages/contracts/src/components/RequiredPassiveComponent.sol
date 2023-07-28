// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct RequiredPassiveData {
  uint256[] ResourceIDs;
  uint32[] RequiredAmounts;
}
uint256 constant ID = uint256(keccak256("component.RequiredPassive"));

contract RequiredPassiveComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "ResourceIDs";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "RequiredAmounts";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, RequiredPassiveData calldata value) public virtual {
    set(entity, abi.encode(value.ResourceIDs, value.RequiredAmounts));
  }

  function getValue(uint256 entity) public view virtual returns (RequiredPassiveData memory) {
    (uint256[] memory resourceIDs, uint32[] memory requiredAmounts) = abi.decode(
      getRawValue(entity),
      (uint256[], uint32[])
    );
    return RequiredPassiveData(resourceIDs, requiredAmounts);
  }

  function getEntitiesWithValue(RequiredPassiveData calldata minesData) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(minesData));
  }
}
