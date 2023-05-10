// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibEncode } from "./LibEncode.sol";

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

  // ###########################################################################
  function transferOneItem(
    Uint256Component component,
    uint256 originEntity,
    uint256 destinationEntity,
    uint256 item1Key
  ) internal {
    uint256 curOrigin1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity))
    );

    uint256 curDestination1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity))
    );

    component.set(LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity)), 0);
    component.set(
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity)),
      curDestination1 + curOrigin1
    );
  }

  function transferTwoItems(
    Uint256Component component,
    uint256 originEntity,
    uint256 destinationEntity,
    uint256 item1Key,
    uint256 item2Key
  ) internal {
    uint256 curOrigin1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity))
    );
    uint256 curOrigin2 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item2Key, entityToAddress(originEntity))
    );

    uint256 curDestination1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity))
    );
    uint256 curDestination2 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item2Key, entityToAddress(destinationEntity))
    );

    component.set(LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity)), 0);
    component.set(LibEncode.hashFromAddress(item2Key, entityToAddress(originEntity)), 0);
    component.set(
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity)),
      curDestination1 + curOrigin1
    );
    component.set(
      LibEncode.hashFromAddress(item2Key, entityToAddress(destinationEntity)),
      curDestination2 + curOrigin2
    );
  }

  function transferThreeItems(
    Uint256Component component,
    uint256 originEntity,
    uint256 destinationEntity,
    uint256 item1Key,
    uint256 item2Key,
    uint256 item3Key
  ) internal {
    uint256 curOrigin1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity))
    );
    uint256 curOrigin2 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item2Key, entityToAddress(originEntity))
    );
    uint256 curOrigin3 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item3Key, entityToAddress(originEntity))
    );

    uint256 curDestination1 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity))
    );
    uint256 curDestination2 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item2Key, entityToAddress(destinationEntity))
    );
    uint256 curDestination3 = getSafeUint256Value(
      component,
      LibEncode.hashFromAddress(item3Key, entityToAddress(destinationEntity))
    );

    component.set(LibEncode.hashFromAddress(item1Key, entityToAddress(originEntity)), 0);
    component.set(LibEncode.hashFromAddress(item2Key, entityToAddress(originEntity)), 0);
    component.set(LibEncode.hashFromAddress(item3Key, entityToAddress(originEntity)), 0);
    component.set(
      LibEncode.hashFromAddress(item1Key, entityToAddress(destinationEntity)),
      curDestination1 + curOrigin1
    );
    component.set(
      LibEncode.hashFromAddress(item2Key, entityToAddress(destinationEntity)),
      curDestination2 + curOrigin2
    );
    component.set(
      LibEncode.hashFromAddress(item3Key, entityToAddress(destinationEntity)),
      curDestination3 + curOrigin3
    );
  }
}
