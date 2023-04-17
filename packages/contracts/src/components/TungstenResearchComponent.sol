// SPDX-License-Identifier: MIT
// New TungstenResearchComponent for researching Tungsten
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.TungstenResearch"));

contract TungstenResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
