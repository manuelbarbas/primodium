// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

uint256 constant ID = uint256(keccak256("system.Blueprint"));

contract PrimodiumSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function get(uint256 id) internal view returns (address) {
    return getAddressById(components, id);
  }

  function execute(bytes memory args) public virtual returns (bytes memory) {}
}
