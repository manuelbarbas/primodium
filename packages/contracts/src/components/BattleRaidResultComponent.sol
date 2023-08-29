// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { RaidResult } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.BattleRaidResult"));

contract BattleRaidResultComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "resources";
    values[0] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[1] = "defenderValuesBeforeRaid";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;

    keys[2] = "raidedAmount";
    values[2] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, RaidResult calldata value) public virtual {
    set(entity, abi.encode(value.resources, value.defenderValuesBeforeRaid, value.raidedAmount));
  }

  function getValue(uint256 entity) public view virtual returns (RaidResult memory) {
    (uint256[] memory resourceIds, uint32[] memory defenderValuesBeforeRaid, uint32[] memory raidedAmount) = abi.decode(
      getRawValue(entity),
      (uint256[], uint32[], uint32[])
    );
    return RaidResult(resourceIds, defenderValuesBeforeRaid, raidedAmount);
  }

  function getEntitiesWithValue(RaidResult calldata mines) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(mines));
  }
}
