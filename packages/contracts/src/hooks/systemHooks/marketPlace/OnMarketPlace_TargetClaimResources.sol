// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { MarketplaceSystem } from "systems/MarketplaceSystem.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { OwnedBy } from "codegen/tables/OwnedBy.sol";
import { MarketplaceOrder } from "codegen/tables/MarketplaceOrder.sol";

/**
 * @title OnMarketPlace_TargetClaimResources
 * @dev This contract is a system hook that claims resources for seller player.
 */
contract OnMarketPlace_TargetClaimResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates information about the space rock after an invasion if it is owned.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory callData
  ) public {
    bytes memory functionSelector = SliceInstance.toBytes(SliceLib.getSubslice(callData, 0, 4));
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    if (bytes4(functionSelector) == MarketplaceSystem.takeOrder.selector) {
      (bytes32 orderId, uint256 count) = abi.decode(args, (bytes32, uint256));
      LibResource.claimAllPlayerResources(MarketplaceOrder.getSeller(orderId));
    } else if (bytes4(functionSelector) == MarketplaceSystem.takeOrderBulk.selector) {
      (bytes32[] memory orderIds, uint256[] memory counts) = abi.decode(args, (bytes32[], uint256[]));
      for (uint256 i = 0; i < orderIds.length; i++) {
        LibResource.claimAllPlayerResources(MarketplaceOrder.getSeller(orderIds[i]));
      }
    }
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
