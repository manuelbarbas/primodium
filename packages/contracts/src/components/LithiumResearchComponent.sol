// SPDX-License-Identifier: MIT
// New LithiumResearchComponent for researching Lithium
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.LithiumResearch"));

contract LithiumResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
