// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { EResource } from "src/Types.sol";
import { Position, TokenPrice } from "codegen/index.sol";

import { MarketplacePrototypeId } from "codegen/Prototypes.sol";
import { LibMath } from "src/libraries/LibMath.sol";

contract MarketplaceSystem is PrimodiumSystem {
  function transfer(
    bytes32 marketplaceEntity,
    EResource resourceFrom,
    EResource resourceTo,
    uint256 amount
  ) public {
    require(
      BuildingType.get(marketplaceEntity) == MarketplacePrototypeId,
      "[Marketplace] Building is not a marketplace"
    );

    bytes32 asteroidEntity = Position.getParent(marketplaceEntity);
    bytes32 playerEntity = _player();
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[Marketplace] Building is not owned by player");

    return LibBuilding.build(_player(), buildingPrototype, coord);
  }

  function getCostSell(EResource resource, uint256 amount) public {
    uint256 price = TokenPrice.get(resource);
    uint256 exponentTimes1000 = P_MarketplaceConfig.getExponentTimes1000(uint8(resource));
    uint256 coefficientTimes1000 = P_MarketplaceConfig.getCoefficientTimes1000(uint8(resource));

    uint256 newPrice = LibMath.integratePolynomial(price, newPrice);

    PoolSupply.set(resource, newSupply);
  }

  function getCostBuy(EResource resource, uint256 amount) public {
    uint256 poolSupply = PoolSupply.get(resource);
  }
}
