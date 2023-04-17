// SPDX-License-Identifier: MIT
// New KimberliteResearchComponent for researching Kimberlite
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.KimberliteResearch"));

contract KimberliteResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
