// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { HealthComponent } from "components/HealthComponent.sol";

library LibHealth {
  function isAlive(HealthComponent component, uint256 entity) internal view returns (bool) {
    return !component.has(entity) || component.getValue(entity) > 0;
  }
}
