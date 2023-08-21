// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/BoolComponent.sol";

uint256 constant ID = uint256(keccak256("component.P_IsUnit"));

//set for Factories to indicate that they are functional
contract P_IsUnitComponent is BoolComponent {
  constructor(address world) BoolComponent(world, ID) {}
}
