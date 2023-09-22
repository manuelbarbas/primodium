// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.HasCompletedObjective"));

//set for buildings to ignore the build limit
contract HasCompletedObjectiveComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
