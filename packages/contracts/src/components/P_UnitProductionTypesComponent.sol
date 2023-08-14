// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/Uint256ArrayComponent.sol";

uint256 constant ID = uint256(keccak256("component.P_UnitProductionTypes"));

contract P_UnitProductionTypesComponent is Uint256ArrayComponent {
  constructor(address world) Uint256ArrayComponent(world, ID) {}
}
