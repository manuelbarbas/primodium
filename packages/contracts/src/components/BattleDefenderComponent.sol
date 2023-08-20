// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import { BattleParticipantComponent } from "../components/base/BattleParticipantComponent.sol";

uint256 constant ID = uint256(keccak256("component.BattleDefender"));

contract BattleDefenderComponent is BattleParticipantComponent {
  constructor(address world) BattleParticipantComponent(world, ID) {}
}
