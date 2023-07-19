// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (Coord memory coord, Coord memory targetCoord, uint256 weaponKey) = abi.decode(args, (Coord, Coord, uint256));

    return abi.encode(coord, targetCoord, weaponKey);
  }

  // select start coord, targetCoord, and weaponKey
  function executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey) public returns (bytes memory) {
    return execute(abi.encode(coord, targetCoord, weaponKey));
  }
}
