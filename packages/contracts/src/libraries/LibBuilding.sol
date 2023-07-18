// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { console } from "forge-std/console.sol";

//components
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibMath } from "libraries/LibMath.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { CoordComponent } from "std-contracts/components/CoordComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { LibTerrain } from "./LibTerrain.sol";
import { LibEncode } from "./LibEncode.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

library LibBuilding {
  function isBuildingLimitConditionMet(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingId
  ) internal view returns (bool) {
    return
      IgnoreBuildLimitComponent(getAddressById(world.components(), IgnoreBuildLimitComponentID)).has(buildingId) ||
      isBuildingCountWithinLimit(world, playerEntity);
  }

  function isBuildingCountWithinLimit(IWorld world, uint256 playerEntity) internal view returns (bool) {
    uint256 baseLevel = getBaseLevel(world, playerEntity);
    uint256 buildCountLimit = getBuildingCountLimit(world, baseLevel);
    uint256 buildingCount = getBuildingCount(world, playerEntity);
    return buildingCount < buildCountLimit;
  }

  function canBuildOnTile(IWorld world, uint256 buildingEntity, Coord memory coord) internal view returns (bool) {
    TileComponent tileComponent = TileComponent(getAddressById(world.components(), TileComponentID));
    return
      !tileComponent.has(buildingEntity) || tileComponent.getValue(buildingEntity) == LibTerrain.getTopLayerKey(coord);
  }

  function getBaseLevel(IWorld world, uint256 playerEntity) internal view returns (uint256) {
    MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
      getAddressById(world.components(), MainBaseInitializedComponentID)
    );

    if (!mainBaseInitializedComponent.has(playerEntity)) return 0;
    uint256 mainBase = mainBaseInitializedComponent.getValue(playerEntity);
    return BuildingLevelComponent(getAddressById(world.components(), BuildingLevelComponentID)).getValue(mainBase);
  }

  function getBuildingCount(IWorld world, uint256 playerEntity) internal view returns (uint256) {
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(world.components(), BuildingLimitComponentID)
    );
    return LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity);
  }

  function getBuildingCountLimit(IWorld world, uint256 baseLevel) internal view returns (uint256) {
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(world.components(), BuildingLimitComponentID)
    );
    if (buildingLimitComponent.has(baseLevel)) return buildingLimitComponent.getValue(baseLevel);
    else revert("Invalid Base Level");
  }

  function isMainBase(uint256 tileId) internal pure returns (bool) {
    return tileId == MainBaseID;
  }
}
