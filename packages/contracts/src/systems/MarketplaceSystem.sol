// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { EResource } from "src/Types.sol";
import { BuildingType, PoolSupply, OwnedBy } from "codegen/index.sol";

import { MarketPrototypeId } from "codegen/Prototypes.sol";

contract MarketplaceSystem is PrimodiumSystem {
  function transferResource(
    bytes32 marketEntity,
    EResource resourceToSell,
    EResource resourceToBuy,
    uint256 amountToTransfer
  ) public _claimResources(OwnedBy.get(marketEntity)) {
    require(resourceToSell != resourceToBuy, "[Marketplace] Cannot transfer same resource");
    require(BuildingType.get(marketEntity) == MarketPrototypeId, "[Marketplace] Building is not a marketplace");

    bytes32 spaceRockEntity = OwnedBy.get(marketEntity);
    require(OwnedBy.get(spaceRockEntity) == _player(), "[Marketplace] Not owned by player");
  }
}
