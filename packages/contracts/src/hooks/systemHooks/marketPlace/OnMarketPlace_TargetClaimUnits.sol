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
import { Home } from "codegen/index.sol";
import { MarketplaceOrder } from "codegen/tables/MarketplaceOrder.sol";

/**
 * @title OnMarketPlace_TargetClaimUnits
 * @dev This contract is a system hook that claims units for seller player.
 */
contract OnMarketPlace_TargetClaimUnits is SystemHook {
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
      (bytes32 orderId, ) = abi.decode(args, (bytes32, uint256));
      bytes32 seller = MarketplaceOrder.getSeller(orderId);
      bytes32 homeAsteroid = Home.get(seller);
      LibUnit.claimUnits(homeAsteroid);
    } else if (bytes4(functionSelector) == MarketplaceSystem.takeOrderBulk.selector) {
      (bytes32[] memory orderIds, ) = abi.decode(args, (bytes32[], uint256[]));
      for (uint256 i = 0; i < orderIds.length; i++) {
        bytes32 seller = MarketplaceOrder.getSeller(orderIds[i]);
        bytes32 homeAsteroid = Home.get(seller);
        LibUnit.claimUnits(homeAsteroid);
      }
    }
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
