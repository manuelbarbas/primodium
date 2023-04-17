// SPDX-License-Identifier: MIT
// New TitaniumResearchComponent for researching Titanium
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.TitaniumResearch"));

contract TitaniumResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
