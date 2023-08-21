// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solecs/Component.sol";
import { ESpaceRockType } from "src/types.sol";

uint256 constant ID = uint256(keccak256("component.AsteroidType"));

contract AsteroidTypeComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](1);
    values = new LibTypes.SchemaValue[](1);

    keys[0] = "value";
    values[0] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, ESpaceRockType value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (ESpaceRockType) {
    uint256 value = abi.decode(getRawValue(entity), (uint256));
    return ESpaceRockType(value);
  }

  function getEntitiesWithValue(ESpaceRockType value) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(uint256(value)));
  }
}
