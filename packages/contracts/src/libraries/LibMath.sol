// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibMath {
  // ###########################################################################
  // Debug Increment function
  function increment(Uint32Component component, uint256 entity) internal {
    uint32 current = component.has(entity) ? component.getValue(entity) : 0;
    component.set(entity, current + 1);
  }

  // ###########################################################################
  function getSafeUint256Value(Uint256Component component, uint256 entity) internal view returns (uint256) {
    return component.has(entity) ? component.getValue(entity) : 0;
  }

  function incrementBy(Uint256Component component, uint256 entity, uint256 incBy) internal {
    uint256 current = getSafeUint256Value(component, entity);
    component.set(entity, current + incBy);
  }

  function transfer(Uint256Component component, uint256 origin, uint256 destination) internal {
    uint256 curOrigin = getSafeUint256Value(component, origin);
    uint256 curDestination = getSafeUint256Value(component, destination);
    component.set(origin, 0);
    component.set(destination, curDestination + curOrigin);
  }

  function transferTwoComponents(
    Uint256Component component1,
    Uint256Component component2,
    uint256 origin,
    uint256 destination
  ) internal {
    uint256 curOrigin1 = getSafeUint256Value(component1, origin);
    uint256 curOrigin2 = getSafeUint256Value(component2, origin);

    uint256 curDestination1 = getSafeUint256Value(component1, destination);
    uint256 curDestination2 = getSafeUint256Value(component2, destination);

    component1.set(origin, 0);
    component2.set(origin, 0);

    component1.set(destination, curDestination1 + curOrigin1);
    component2.set(destination, curDestination2 + curOrigin2);
  }

  function transferThreeComponents(
    Uint256Component component1,
    Uint256Component component2,
    Uint256Component component3,
    uint256 origin,
    uint256 destination
  ) internal {
    uint256 curOrigin1 = getSafeUint256Value(component1, origin);
    uint256 curOrigin2 = getSafeUint256Value(component2, origin);
    uint256 curOrigin3 = getSafeUint256Value(component3, origin);

    uint256 curDestination1 = getSafeUint256Value(component1, destination);
    uint256 curDestination2 = getSafeUint256Value(component2, destination);
    uint256 curDestination3 = getSafeUint256Value(component3, destination);

    component1.set(origin, 0);
    component2.set(origin, 0);
    component3.set(origin, 0);

    component1.set(destination, curDestination1 + curOrigin1);
    component2.set(destination, curDestination2 + curOrigin2);
    component3.set(destination, curDestination3 + curOrigin3);
  }
}
