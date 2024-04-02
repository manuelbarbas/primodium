// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { LibStorage } from "src/libraries/LibStorage.sol";
import { P_IsResource, Reserves, ReservesData, P_MarketplaceConfig } from "codegen/index.sol";
import { EResource } from "src/Types.sol";

/**
 * @title LibMarketplace
 * @dev Library to handle resource swaps in a marketplace setting within the game.
 */
library LibMarketplace {
  /**
   * @notice Swaps resources in the marketplace following a specified path.
   * @param to The address to which the swapped resources are credited.
   * @param path An array representing the swap path through different resources.
   * @param amountIn The amount of the initial resource to swap.
   * @param amountOutMin The minimum amount of the final resource to receive from the swap.
   * @return amountReceived The final amount of resource received after the swap.
   * @dev This function iteratively swaps resources along the path, updating reserves accordingly.
   */
  function swap(
    bytes32 to,
    EResource[] memory path,
    uint256 amountIn,
    uint256 amountOutMin
  ) internal returns (uint256 amountReceived) {
    require(amountIn > 0, "[Marketplace] Invalid amount");
    require(path.length > 1, "[Marketplace] Invalid path");
    require(P_IsResource.getIsResource(uint8(path[0])), "[Marketplace] Invalid resource");

    LibStorage.checkedDecreaseStoredResource(to, uint8(path[0]), amountIn);

    // amount received represents the amount of the previous resource in the path
    // the final amount received is the amount the user is transferred
    amountReceived = amountIn;
    for (uint256 i = 0; i < path.length - 1; i++) {
      amountReceived = _swap(uint8(path[i]), uint8(path[i + 1]), amountReceived);
    }

    require(amountReceived >= amountOutMin, "[Marketplace] Insufficient output amount");
    LibStorage.increaseStoredResource(to, uint8(path[path.length - 1]), amountReceived);
  }

  /**
   * @notice Internal function to handle the swap of one resource for another.
   * @param resourceIn The resource being swapped in.
   * @param resourceOut The resource being swapped out for.
   * @param amountIn The amount of the input resource.
   * @return amountOut The amount of the output resource obtained from the swap.
   * @dev Updates reserves based on the swap and ensures liquidity is maintained.
   */
  function _swap(uint8 resourceIn, uint8 resourceOut, uint256 amountIn) internal returns (uint256 amountOut) {
    require(resourceIn != resourceOut, "[Marketplace] Cannot swap for same resource");
    require(P_IsResource.getIsResource(resourceOut), "[Marketplace] Invalid resource");
    // resourceA is always the smaller index to ensure we don't have two curves for the same pair
    (uint8 resourceA, uint8 resourceB) = resourceIn < resourceOut
      ? (resourceIn, resourceOut)
      : (resourceOut, resourceIn);

    ReservesData memory reserves = Reserves.get(resourceA, resourceB);
    (uint256 reserveIn, uint256 reserveOut) = resourceA == resourceIn
      ? (reserves.amountA, reserves.amountB)
      : (reserves.amountB, reserves.amountA);

    require(amountIn < reserveIn, "[Marketplace] Insufficient liquidity");

    amountOut = getAmountOut(amountIn, reserveIn, reserveOut);

    (uint256 newReserveA, uint256 newReserveB) = resourceIn == resourceA
      ? (reserveIn + amountIn, reserveOut - amountOut)
      : (reserveOut - amountOut, reserveIn + amountIn);

    Reserves.set(resourceA, resourceB, newReserveA, newReserveB);
  }

  /**
   * @notice Calculates the output amount of a resource swap given input amount and reserves.
   * @param amountIn The amount of the input resource.
   * @param reserveIn The reserve amount of the input resource.
   * @param reserveOut The reserve amount of the output resource.
   * @return amountOut The calculated output amount for the swap.
   * @dev Takes the marketplace fee into account for the calculation.
   */
  function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
  ) internal view returns (uint256 amountOut) {
    uint256 amountInWithFee = amountIn * (1e3 - P_MarketplaceConfig.getFeeThousandths());
    uint256 numerator = amountInWithFee * reserveOut;
    uint256 denominator = (reserveIn * 1000) + amountInWithFee;
    amountOut = numerator / denominator;
  }
}
