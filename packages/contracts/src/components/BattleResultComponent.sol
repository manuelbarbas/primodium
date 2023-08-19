// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { BattleResult } from "../types.sol";

uint256 constant ID = uint256(keccak256("component.BattleResult"));

contract BattleResultComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "winner";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "attackerUnitsLeft";
    values[1] = LibTypes.SchemaValue.UINT32_ARRAY;

    keys[2] = "defenderUnitsLeft";
    values[2] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, BattleResult calldata value) public virtual {
    set(entity, abi.encode(value.winnerEntity, value.attackerUnitsLeft, value.defenderUnitsLeft));
  }

  function set(
    uint256 entity,
    uint256 winnerEntity,
    uint32[] memory attackerUnitsLeft,
    uint32[] memory defenderUnitsLeft
  ) public virtual {
    set(entity, abi.encode(winnerEntity, attackerUnitsLeft, defenderUnitsLeft));
  }

  function getValue(uint256 entity) public view virtual returns (BattleResult memory) {
    (uint256 winnerEntity, uint32[] memory attackerUnitsLeft, uint32[] memory defenderUnitsLeft) = abi.decode(
      getRawValue(entity),
      (uint256, uint32[], uint32[])
    );
    return BattleResult(winnerEntity, attackerUnitsLeft, defenderUnitsLeft);
  }

  function getEntitiesWithValue(BattleResult calldata result) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(result));
  }
}
