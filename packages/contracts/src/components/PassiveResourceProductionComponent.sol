// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import "std-contracts/components/Uint256Component.sol";

uint256 constant ID = uint256(keccak256("component.PassiveResourceProduction"));

struct PassiveResourceProductionData {
  uint256 ResourceID;
  uint256 ResourceProduction;
}

contract PassiveResourceProductionComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "ResourceID";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "ResourceProduction";
    values[1] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, PassiveResourceProductionData calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (PassiveResourceProductionData memory) {
    (uint256 resourceID, uint256 resourceProduction) = abi.decode(getRawValue(entity), (uint256, uint256));
    return PassiveResourceProductionData(resourceID, resourceProduction);
  }

  function getEntitiesWithValue(
    PassiveResourceProductionData calldata passiveResourceProductionData
  ) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(passiveResourceProductionData));
  }
}
