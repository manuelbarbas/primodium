// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { LibResource } from "src/libraries/LibResource.sol";
import { LibStorage } from "src/libraries/LibStorage.sol";
import { ResourceCount, Reserves, ReservesData, P_MarketplaceConfig } from "codegen/index.sol";
import { RESERVE_CURRENCY } from "src/constants.sol";
import { EResource } from "src/Types.sol";

library LibMarketplace {
  function swap(
    bytes32 to,
    EResource[] memory path,
    uint256 amountIn,
    uint256 amountOutMin
  ) internal {
    require(amountIn > 0, "[Marketplace] Invalid amount");
    require(path.length > 1, "[Marketplace] Invalid path");

    LibStorage.checkedDecreaseStoredResource(to, uint8(path[0]), amountIn);

    uint256 amountOut = amountIn;
    for (uint256 i = 0; i < path.length - 1; i++) {
      amountOut = _swap(uint8(path[i]), uint8(path[i + 1]), amountOut);
    }

    require(amountOut >= amountOutMin, "[Marketplace] Insufficient output amount");
    LibStorage.increaseStoredResource(to, uint8(path[path.length - 1]), amountOut);
  }

  function _swap(
    uint8 resourceIn,
    uint8 resourceOut,
    uint256 amountIn
  ) internal returns (uint256 amountOut) {
    require(resourceIn != resourceOut, "[Marketplace] Cannot swap for same resource");
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

  // Helper function to calculate output amount
  function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
  ) internal view returns (uint256 amountOut) {
    uint256 amountInWithFee = amountIn * (1e3 - P_MarketplaceConfig.getSlippageThousandths());
    uint256 numerator = amountInWithFee * reserveOut;
    uint256 denominator = (reserveIn * 1000) + amountInWithFee;
    amountOut = numerator / denominator;
  }
}
