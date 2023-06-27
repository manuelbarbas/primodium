// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { MinerID, LithiumMinerID, BasicMinerID, HardenedDrillID, PrecisionPneumaticDrillID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibDebug } from "./LibDebug.sol";
import { LibEncode } from "./LibEncode.sol";

library LibNewMine {
  function claimResourcesFromMines(
    Uint256Component mineComponent,
    Uint256Component storageCapacityComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    Uint256Component pathComponent,
    Uint256Component lastBuiltPathAt,
    Uint256ArrayComponent storageCapacityResourcesComponent,
    uint256 playerEntity
  ) internal {
    uint256 mainBaseEntity = buildingComponent.getValue(playerEntity);
    uint256[] memory pathEntities = pathComponent.getEntitiesWithValue(mainBaseEntity);
    for (uint256 i; i < pathEntities.length; i++) {
      if (!mineComponent.has(pathEntities[i])) continue;
    }
  }

  function syncMineProduction() internal {}

  function checkAndUpdateResourceProductionOnBuildPathFromMine(
    Uint256Component mineComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 fromEntity,
    uint256 toEntity
  ) internal {
    if (!mineComponent.has(fromEntity) || tileComponent.getValue(toEntity) != MainBaseID) return;
    uint256 resourceId = tileComponent.getValue(fromEntity);
    uint256 resourceProductionIncrease = mineComponent.getValue(fromEntity);
    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    mineComponent.set(fromEntity, 0);
  }
}
