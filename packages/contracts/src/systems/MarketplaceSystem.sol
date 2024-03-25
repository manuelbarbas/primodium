// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { EResource } from "src/Types.sol";
import { BuildingType, OwnedBy, Reserves, ReservesData, P_MarketplaceConfig, Swap } from "codegen/index.sol";
import { LibMarketplace } from "libraries/LibMarketplace.sol";

import { MarketPrototypeId } from "codegen/Prototypes.sol";

contract MarketplaceSystem is PrimodiumSystem {
  /**
   * @dev Ensures the marketplace is not locked before proceeding with the function call.
   */
  modifier onlyUnlocked() {
    require(!P_MarketplaceConfig.getLock(), "[Marketplace] Marketplace is locked");
    _;
  }

  /**
   * @notice Toggles the lock state of the marketplace.
   * @dev Can only be called by the admin. Flips the current lock state of the marketplace.
   */
  function toggleMarketplaceLock() public onlyAdmin {
    bool wasLocked = P_MarketplaceConfig.getLock();
    P_MarketplaceConfig.setLock(!wasLocked);
  }

  /**
   * @notice Adds liquidity to a resource pair in the marketplace.
   * @dev Can only be called by the admin. Adds specified amounts of two different resources to the marketplace liquidity pool.
   * @param resourceA First resource in the liquidity pair.
   * @param resourceB Second resource in the liquidity pair.
   * @param liquidityA Amount of the first resource to add.
   * @param liquidityB Amount of the second resource to add.
   */
  function addLiquidity(
    EResource resourceA,
    EResource resourceB,
    uint256 liquidityA,
    uint256 liquidityB
  ) public onlyAdmin {
    require(resourceA != resourceB, "[Marketplace] Cannot add liquidity for same resource");
    require(liquidityA > 0 || liquidityB > 0, "[Marketplace] Cannot add 0 liquidity");

    ReservesData memory reserves = Reserves.get(uint8(resourceA), uint8(resourceB));
    Reserves.set(uint8(resourceA), uint8(resourceB), reserves.amountA + liquidityA, reserves.amountB + liquidityB);
  }

  /**
   * @notice Removes liquidity from a resource pair in the marketplace.
   * @dev Can only be called by the admin. Removes specified amounts of two different resources from the marketplace liquidity pool.
   * @param resourceA First resource in the liquidity pair.
   * @param resourceB Second resource in the liquidity pair.
   * @param liquidityA Amount of the first resource to remove.
   * @param liquidityB Amount of the second resource to remove.
   */
  function removeLiquidity(
    EResource resourceA,
    EResource resourceB,
    uint256 liquidityA,
    uint256 liquidityB
  ) public onlyAdmin {
    require(resourceA != resourceB, "[Marketplace] Cannot remove liquidity for same resource");
    require(liquidityA > 0 || liquidityB > 0, "[Marketplace] Cannot remove 0 liquidity");

    ReservesData memory reserves = Reserves.get(uint8(resourceA), uint8(resourceB));
    require(reserves.amountA >= liquidityA && reserves.amountB >= liquidityB, "[Marketplace] Not enough liquidity");
    Reserves.set(uint8(resourceA), uint8(resourceB), reserves.amountA - liquidityA, reserves.amountB - liquidityB);
  }

  /**
   * @notice Performs a swap operation in the marketplace.
   * @dev Swaps a specified amount of one resource for another, according to the provided path, while ensuring the marketplace is unlocked and the user has sufficient resources.
   * @param marketEntity The unique identifier for the marketplace entity.
   * @param path An array defining the swap path between resources.
   * @param amountIn The amount of the initial resource to swap.
   * @param amountOutMin The minimum amount of the final resource expected to receive.
   */
  function swap(
    bytes32 marketEntity,
    EResource[] memory path,
    uint256 amountIn,
    uint256 amountOutMin
  ) public onlyUnlocked _claimResources(OwnedBy.get(marketEntity)) {
    require(BuildingType.get(marketEntity) == MarketPrototypeId, "[Marketplace] Building is not a marketplace");

    bytes32 asteroidEntity = OwnedBy.get(marketEntity);
    require(OwnedBy.get(asteroidEntity) == _player(), "[Marketplace] Not owned by player");

    uint256 amountOut = LibMarketplace.swap(asteroidEntity, path, amountIn, amountOutMin);
    Swap.set(_player(), uint8(path[0]), uint8(path[path.length - 1]), amountIn, amountOut);
  }
}
