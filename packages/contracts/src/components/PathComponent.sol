// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "std-contracts/components/Uint256BareComponent.sol";

uint256 constant ID = uint256(keccak256("component.Path"));

contract PathComponent is Uint256BareComponent {
  constructor(address world) Uint256BareComponent(world, ID) {}
}

// entity id: the start conveyer tile
// value: the end conveyer tile
