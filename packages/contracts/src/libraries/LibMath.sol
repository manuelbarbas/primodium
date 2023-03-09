// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibMath {
  function increment(Uint32Component component, uint256 entity) internal {
    uint32 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + 1);
  }

  function incrementBy(Uint256Component component, uint256 entity, uint256 incBy) internal {
    uint256 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + incBy);
  }

  function transfer(Uint256Component component, uint256 origin, uint256 destination) internal {
    uint256 curOrigin = component.has(origin) ? component.getValue(origin) : 0;
    uint256 curDestination = component.has(destination) ? component.getValue(destination) : 0;
    component.set(origin, 0);
    component.set(destination, curDestination + curOrigin);
  }
}
