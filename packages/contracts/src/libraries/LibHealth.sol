// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibHealth {
  // TEMP: default health if health component doesn't exist.
  uint256 constant MAX_HEALTH = 100;

  // TEMP: to be changed when level up siloes
  int256 constant ATTACK_RADIUS = 5;
  uint256 constant ATTACK_DAMAGE = 20;

  function checkAlive(Uint256Component component, uint256 entity) internal view returns (bool) {
    uint256 entityHealth = component.has(entity) ? component.getValue(entity) : MAX_HEALTH;
    return entityHealth > 0;
  }
}
