// SPDX-License-Identifier: MIT
// New IridiumResearchComponent for researching Iridium
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.IridiumResearch"));

contract IridiumResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
