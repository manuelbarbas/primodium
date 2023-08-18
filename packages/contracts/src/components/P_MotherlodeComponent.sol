// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { Motherlode, EMotherlodeSize, EMotherlodeType } from "src/types.sol";

uint256 constant ID = uint256(keccak256("component.P_Motherlode"));

contract P_MotherlodeComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "size";
    values[0] = LibTypes.SchemaValue.UINT8;

    keys[1] = "motherlodeType";
    values[1] = LibTypes.SchemaValue.UINT8;

    keys[2] = "cooldownBlocks";
    values[2] = LibTypes.SchemaValue.UINT256;
  }

  function set(uint256 entity, Motherlode calldata motherlode) public virtual {
    set(entity, abi.encode(uint32(motherlode.size), uint32(motherlode.motherlodeType), motherlode.cooldownBlocks));
  }

  function getValue(uint256 entity) public view virtual returns (Motherlode memory) {
    (uint32 size, uint32 motherlodeType, uint256 cooldownBlocks) = abi.decode(
      getRawValue(entity),
      (uint32, uint32, uint256)
    );
    return Motherlode(EMotherlodeSize(size), EMotherlodeType(motherlodeType), cooldownBlocks);
  }

  function getEntitiesWithValue(Motherlode calldata motherlode) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(motherlode));
  }
}
