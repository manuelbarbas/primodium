// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibBattle } from "libraries/LibBattle.sol";
import { ESendType } from "src/Types.sol";
import { BattleResultData } from "codegen/Tables.sol";

contract S_BattleSystem is PrimodiumSystem {
  // NOTE: logic testing occurs in LibBattle.t.sol
  function battle(
    bytes32 attackerEntity,
    bytes32 defenderEntity,
    bytes32 rockEntity,
    ESendType sendType
  ) public returns (BattleResultData memory) {
    return LibBattle.battle(attackerEntity, defenderEntity, rockEntity, sendType);
  }
}
