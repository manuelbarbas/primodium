// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

import { BattleParticipant } from "../../types.sol";

abstract contract BattleParticipantComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "participantEntity";
    values[0] = LibTypes.SchemaValue.UINT256;

    keys[1] = "unitTypes";
    values[1] = LibTypes.SchemaValue.UINT256_ARRAY;

    keys[2] = "unitLevels";
    values[2] = LibTypes.SchemaValue.UINT32_ARRAY;

    keys[3] = "unitCounts";
    values[3] = LibTypes.SchemaValue.UINT32_ARRAY;
  }

  function set(uint256 entity, BattleParticipant calldata value) public virtual {
    set(entity, abi.encode(value.participantEntity, value.unitTypes, value.unitLevels, value.unitCounts));
  }

  function set(
    uint256 entity,
    uint256 participantEntity,
    uint256[] memory unitTypes,
    uint32[] memory unitLevels,
    uint32[] memory unitCounts
  ) public virtual {
    set(entity, abi.encode(participantEntity, unitTypes, unitLevels, unitCounts));
  }

  function getValue(uint256 entity) public view virtual returns (BattleParticipant memory) {
    (
      uint256 participantEntity,
      uint256[] memory unitTypes,
      uint32[] memory unitLevels,
      uint32[] memory unitCounts
    ) = abi.decode(getRawValue(entity), (uint256, uint256[], uint32[], uint32[]));
    return BattleParticipant(participantEntity, unitTypes, unitLevels, unitCounts);
  }

  function getEntitiesWithValue(BattleParticipant calldata result) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(result));
  }
}
