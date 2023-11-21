// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { MarketplaceSystem } from "systems/MarketplaceSystem.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { MarketplaceOrder, MarketplaceOrderData, ResourceCount } from "codegen/index.sol";
import { LibResource } from "codegen/Libraries.sol";

/**
 * @title OnRecall_TargetClaimResources
 * @dev This contract is a system hook that claims resources for target player.
 */
contract OnTakeOrder_ClaimResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates information about the space rock after an invasion if it is owned.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory functionSelector = SliceInstance.toBytes(SliceLib.getSubslice(callData, 0, 4));
    if (bytes4(functionSelector) == MarketplaceSystem.takeOrder.selector) {
      bytes32 playerEntity = addressToEntity(msgSender);
      bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
      (bytes32 orderId, uint256 countBought) = abi.decode(args, (bytes32, uint256));

      if (countBought == 0) revert("[MarketplaceSystem] Invalid count");
      MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
      require(order.seller != playerEntity, "[MarketplaceSystem] Cannot take your own order");
      require(order.count >= countBought, "[MarketplaceSystem] Not enough resource in order");

      LibResource.claimAllResources(order.seller);
      require(
        ResourceCount.get(order.seller, order.resource) >= countBought,
        "[MarketplaceSystem] Seller doesn't have enough resources"
      );

      require(
        LibResource.getResourceCountAvailable(playerEntity, order.resource) >= countBought,
        "[MarketplaceSystem] Buyer doesn't have enough space"
      );
    }
  }

  /**
   * @dev This function is called after the system's main logic is executed. It doesn't perform any specific actions in this case.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // This function doesn't perform any actions in this case.
  }
}
