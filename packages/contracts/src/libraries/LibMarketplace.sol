// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { LibResource } from "src/libraries/LibResource.sol";
import { LibStorage } from "src/libraries/LibStorage.sol";
import { ResourceCount, Reserves, ReservesData, P_MarketplaceConfig } from "codegen/index.sol";
import { RESERVE_CURRENCY } from "src/constants.sol";

library LibMarketplace {
  function swap(
    bytes32 to,
    uint8 resourceIn,
    uint8 resourceOut,
    uint256 amountIn,
    uint256 amountOutMin
  ) internal {
    require(amountIn > 0, "[Marketplace] Invalid amount");
    if (resourceIn == RESERVE_CURRENCY || resourceOut == RESERVE_CURRENCY) {
      _swap(to, resourceIn, resourceOut, amountIn, amountOutMin);
    } else {
      _swapAcrossCurves(to, resourceIn, resourceOut, amountIn, amountOutMin);
    }
  }

  function _swap(
    bytes32 to,
    uint8 resourceIn,
    uint8 resourceOut,
    uint256 amountIn,
    uint256 amountOutMin
  ) internal {
    LibStorage.checkedDecreaseStoredResource(to, resourceIn, amountIn);
    (uint8 resourceA, uint8 resourceB) = resourceIn < resourceOut
      ? (resourceIn, resourceOut)
      : (resourceOut, resourceIn);
    ReservesData memory reserves = Reserves.get(resourceA, resourceB);
    (uint256 reserveIn, uint256 reserveOut) = resourceA == resourceIn
      ? (reserves.amountA, reserves.amountB)
      : (reserves.amountB, reserves.amountA);

    require(amountIn < reserveIn, "[Marketplace] Insufficient liquidity");

    uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
    require(amountOut >= amountOutMin, "[Marketplace] Insufficient output amount");

    (uint256 newReserveA, uint256 newReserveB) = resourceIn == resourceA
      ? (reserveIn + amountIn, reserveOut - amountOut)
      : (reserveOut - amountOut, reserveIn + amountIn);

    LibStorage.increaseStoredResource(to, resourceOut, amountOut);
    Reserves.set(resourceA, resourceB, newReserveA, newReserveB);
  }

  // this function should be generalized to be a path of swaps in a later version once the amm is fleshed out, but for now it's just a single swap
  function _swapAcrossCurves(
    bytes32 to,
    uint8 resourceIn,
    uint8 resourceOut,
    uint256 amountIn,
    uint256 amountOutMin
  ) private {
    LibStorage.checkedDecreaseStoredResource(to, resourceIn, amountIn);
    // first, put the resourceIn into its pair with the reserve currency
    (uint8 resourceA, uint8 resourceB) = resourceIn < RESERVE_CURRENCY
      ? (resourceIn, RESERVE_CURRENCY)
      : (RESERVE_CURRENCY, resourceIn);
    ReservesData memory reserves = Reserves.get(resourceA, resourceB);
    (uint256 reserveIn, uint256 reserveOut) = resourceA == resourceIn
      ? (reserves.amountA, reserves.amountB)
      : (reserves.amountB, reserves.amountA);

    require(amountIn < reserveIn, "[Marketplace] Insufficient liquidity");

    // this will be the in amount for the second swap
    uint256 reserveCurrencyAmount = getAmountOut(amountIn, reserveIn, reserveOut);

    (uint256 newReserveA, uint256 newReserveB) = resourceIn == resourceA
      ? (reserveIn + amountIn, reserveOut - reserveCurrencyAmount)
      : (reserveOut - reserveCurrencyAmount, reserveIn + amountIn);

    Reserves.set(resourceA, resourceB, newReserveA, newReserveB);

    // second, put the reserve currency into its pair with the resourceOut and give it to the player
    (resourceA, resourceB) = RESERVE_CURRENCY < resourceOut
      ? (RESERVE_CURRENCY, resourceOut)
      : (resourceOut, RESERVE_CURRENCY);
    reserves = Reserves.get(resourceA, resourceB);
    (reserveIn, reserveOut) = RESERVE_CURRENCY == resourceA
      ? (reserves.amountA, reserves.amountB)
      : (reserves.amountB, reserves.amountA);

    require(reserveCurrencyAmount < reserveIn, "[Marketplace] Insufficient liquidity");

    uint256 amountOut = getAmountOut(reserveCurrencyAmount, reserveIn, reserveOut);
    require(amountOut >= amountOutMin, "[Marketplace] Insufficient output amount");

    (newReserveA, newReserveB) = RESERVE_CURRENCY == resourceA
      ? (reserveIn + reserveCurrencyAmount, reserveOut - amountOut)
      : (reserveOut - amountOut, reserveIn + reserveCurrencyAmount);

    LibStorage.increaseStoredResource(to, resourceOut, amountOut);
    Reserves.set(resourceA, resourceB, newReserveA, newReserveB);
  }

  // Helper function to calculate output amount
  function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
  ) internal view returns (uint256 amountOut) {
    uint256 amountInWithFee = amountIn * (1e3 - P_MarketplaceConfig.getFeeTimes1e3());
    uint256 numerator = amountInWithFee * reserveOut;
    uint256 denominator = (reserveIn * 1000) + amountInWithFee;
    amountOut = numerator / denominator;
  }
}
