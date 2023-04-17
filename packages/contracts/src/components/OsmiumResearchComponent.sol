// SPDX-License-Identifier: MIT
// New OsmiumResearchComponent for researching Osmium
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.OsmiumResearch"));

contract OsmiumResearchComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
