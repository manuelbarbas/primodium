// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { HealthComponent } from "components/HealthComponent.sol";

library LibHealth {
  function checkAlive(HealthComponent component, uint256 entity) internal view returns (bool) {
    if (!component.has(entity)) {
      return true;
    } else {
      return component.getValue(entity) > 0;
    }
  }
}
