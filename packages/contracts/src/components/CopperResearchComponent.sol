// SPDX-License-Identifier: MIT
// New CopperResearchComponent for researching Copper
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.CopperResearch"));

contract CopperResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
