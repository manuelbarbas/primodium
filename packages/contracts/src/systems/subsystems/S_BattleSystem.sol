// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { LibBattle } from "libraries/LibBattle.sol";
import { ESendType } from "src/Types.sol";
import { BattleResultData } from "codegen/index.sol";

contract S_BattleSystem is System {
  /**
   * @dev Initiates a battle between two entities using the LibBattle library.
   * @param attackerEntity The identifier of the attacker entity.
   * @param defenderEntity The identifier of the defender entity.
   * @param rockEntity The identifier of the asteroid/rock involved in the battle.
   * @param sendType The type of the battle, e.g., Raid or other.
   * @return battleResult The battle result data including units left, winner, and cargo.
   */
  function battle(
    bytes32 attackerEntity,
    bytes32 defenderEntity,
    bytes32 rockEntity,
    ESendType sendType
  ) public returns (BattleResultData memory) {
    return LibBattle.battle(attackerEntity, defenderEntity, rockEntity, sendType);
  }

  function getAttackPoints(
    bytes32 invader,
    bytes32 rockEntity,
    ESendType sendType
  )
    public
    returns (
      uint256[] memory,
      uint256,
      uint256
    )
  {
    return LibBattle.getAttackPoints(invader, rockEntity, sendType);
  }

  function updateUnitsAfterBattle(BattleResultData memory br, ESendType sendType) public {
    LibBattle.updateUnitsAfterBattle(br, sendType);
  }
}
