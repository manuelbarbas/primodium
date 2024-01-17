// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { EResource } from "src/Types.sol";
import { BuildingType, Position, PoolSupply, ResourceCount, OwnedBy } from "codegen/index.sol";
import { RESERVE_CURRENCY } from "src/constants.sol";

import { MarketPrototypeId } from "codegen/Prototypes.sol";
import { LibMath } from "src/libraries/LibMath.sol";
import { LibStorage } from "src/libraries/LibStorage.sol";
import { ABDKMath64x64 as Math } from "abdk/ABDKMath64x64.sol";

library LibMarketplace {
  function buy(
    bytes32 spaceRockEntity,
    uint8 resourceToBuy,
    uint256 amountToBuy
  ) internal {
    uint256 poolSupply = PoolSupply.get((resourceToBuy));
    require(poolSupply > amountToBuy, "[Marketplace] Not enough tokens in pool");

    uint256 poolBalance = getPoolBalanceBuy(poolSupply);
    uint256 newPoolBalance = getPoolBalanceBuy(poolSupply - amountToBuy);
    PoolSupply.set(resourceToBuy, poolSupply - amountToBuy);
    uint256 reserveTokensSpent = newPoolBalance - poolBalance;

    _transfer(spaceRockEntity, RESERVE_CURRENCY, reserveTokensSpent, resourceToBuy, amountToBuy);
  }

  function sell(
    bytes32 spaceRockEntity,
    uint8 resourceToSell,
    uint256 amountToSell
  ) internal {
    uint256 poolSupply = PoolSupply.get((resourceToSell));

    uint256 poolBalance = getPoolBalanceSell(poolSupply);
    uint256 newPoolBalance = getPoolBalanceSell(poolSupply + amountToSell);
    PoolSupply.set(resourceToSell, poolSupply + amountToSell);
    uint256 reserveTokensReceived = newPoolBalance - poolBalance;

    _transfer(spaceRockEntity, resourceToSell, amountToSell, RESERVE_CURRENCY, reserveTokensReceived);
  }

  function transfer(
    bytes32 spaceRockEntity,
    uint8 resourceToSell,
    uint8 resourceToBuy,
    uint256 amountToSell
  ) internal {
    uint256 sellPoolSupply = PoolSupply.get((resourceToSell));

    uint256 sellPoolBalance = getPoolBalanceSell(sellPoolSupply);
    uint256 sellNewPoolBalance = getPoolBalanceSell(sellPoolSupply + amountToSell);
    PoolSupply.set(resourceToSell, sellPoolSupply + amountToSell);
    uint256 reserveTokensReceived = sellNewPoolBalance - sellPoolBalance;

    uint256 buyPoolSupply = PoolSupply.get((resourceToBuy));
    require(buyPoolSupply > reserveTokensReceived, "[Marketplace] Not enough tokens in pool");
    uint256 buyPoolBalance = getPoolBalanceBuy(buyPoolSupply);
    uint256 buyNewPoolBalance = getPoolBalanceBuy(buyPoolSupply - reserveTokensReceived);
    PoolSupply.set(resourceToBuy, buyPoolSupply - reserveTokensReceived);
    uint256 amountToBuy = buyPoolBalance - buyNewPoolBalance;

    _transfer(spaceRockEntity, resourceToSell, amountToSell, resourceToBuy, amountToBuy);
  }

  function _transfer(
    bytes32 spaceRockEntity,
    uint8 resourceToSell,
    uint256 amountToSell,
    uint8 resourceToBuy,
    uint256 amountToBuy
  ) internal {
    uint256 spaceRockResourceCount = ResourceCount.get(spaceRockEntity, resourceToSell);
    require(amountToSell <= spaceRockResourceCount, "[SpendResources] Not enough resources to spend");

    LibStorage.decreaseStoredResource(spaceRockEntity, resourceToSell, amountToSell);
    LibStorage.increaseStoredResource(spaceRockEntity, resourceToBuy, amountToBuy);
  }

  // the sell function is: 5e13 * (x^1.5)
  // the integral of this function is 2e13 * (x^2.5)
  function getPoolBalanceSell(uint256 tokenSupply) internal returns (uint256) {
    return getPoolBalance(tokenSupply, 2e13, Math.divu(5, 2));
  }

  // The buy function is: 10e13 * (x^1.5)
  // the integral of this function is 4e13 * (x^2.5)
  function getPoolBalanceBuy(uint256 tokenSupply) internal returns (uint256) {
    return getPoolBalance(tokenSupply, 4e13, Math.divu(5, 2));
  }

  function getPoolBalance(
    uint256 tokenSupply,
    uint256 coefficient,
    int128 exp64x64
  ) internal returns (uint256) {
    return coefficient * Math.toUInt(LibMath.pow(Math.fromUInt(tokenSupply), exp64x64));
  }
}
