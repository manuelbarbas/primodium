// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { EResource } from "src/Types.sol";
import { BuildingType, Position, PoolSupply, ResourceCount, OwnedBy } from "codegen/index.sol";
import { RESERVE_CURRENCY } from "src/constants.sol";

import { MarketPrototypeId } from "codegen/Prototypes.sol";
import { LibMath } from "src/libraries/LibMath.sol";
import { LibStorage } from "src/libraries/LibStorage.sol";
import { LibMarketplace } from "src/libraries/LibMarketplace.sol";
import { ABDKMath64x64 as Math } from "abdk/ABDKMath64x64.sol";

contract MarketplaceSystem is PrimodiumSystem {
  function transferResource(
    bytes32 marketEntity,
    EResource resourceToSell,
    EResource resourceToBuy,
    uint256 amountToTransfer
  ) public _claimResources(marketplaceEntity) {
    require(resourceToSell != resourceToBuy, "[Marketplace] Cannot transfer same resource");
    require(BuildingType.get(marketEntity) == MarketPrototypeId, "[Marketplace] Building is not a marketplace");

    bytes32 spaceRockEntity = OwnedBy.get(marketplaceEntity);
    require(OwnedBy.get(spaceRockEntity) == _player(), "[Marketplace] Not owned by player");

    if (uint8(resourceToSell) == RESERVE_CURRENCY) {
      LibMarketplace.buy(spaceRockEntity, uint8(resourceToBuy), amountToTransfer);
    } else if (uint8(resourceToBuy) == RESERVE_CURRENCY) {
      LibMarketplace.sell(spaceRockEntity, uint8(resourceToSell), amountToTransfer);
    } else {
      LibMarketplace.transfer(spaceRockEntity, uint8(resourceToSell), uint8(resourceToBuy), amountToTransfer);
    }
  }
}
