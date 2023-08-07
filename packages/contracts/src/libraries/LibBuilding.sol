// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

//components
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";

import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";

import { MainBaseID } from "../prototypes.sol";

import { Coord } from "../types.sol";
import { LibMath } from "libraries/LibMath.sol";

import { LibTerrain } from "./LibTerrain.sol";

library LibBuilding {
  function isMaxBuildingsMet(IWorld world, uint256 playerEntity, uint256 buildingId) internal view returns (bool) {
    if (IgnoreBuildLimitComponent(getAddressById(world.components(), IgnoreBuildLimitComponentID)).has(buildingId))
      return true;
    uint32 baseLevel = getBaseLevel(world, playerEntity);
    uint32 buildCountLimit = getMaxBuildingCount(world, baseLevel);
    uint32 buildingCount = getBuildingCount(world, playerEntity);
    return buildingCount < buildCountLimit;
  }

  function canBuildOnTile(IWorld world, uint256 buildingEntity, Coord memory coord) internal view returns (bool) {
    RequiredTileComponent requiredTileComponent = RequiredTileComponent(
      getAddressById(world.components(), RequiredTileComponentID)
    );
    return
      !requiredTileComponent.has(buildingEntity) ||
      requiredTileComponent.getValue(buildingEntity) == LibTerrain.getTopLayerKey(coord);
  }

  function getBaseLevel(IWorld world, uint256 playerEntity) internal view returns (uint32) {
    MainBaseComponent mainBaseComponent = MainBaseComponent(getAddressById(world.components(), MainBaseComponentID));

    if (!mainBaseComponent.has(playerEntity)) return 0;
    uint256 mainBase = mainBaseComponent.getValue(playerEntity);
    return LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(mainBase);
  }

  function getBuildingCount(IWorld world, uint256 playerEntity) internal view returns (uint32) {
    BuildingCountComponent maxBuildingsComponent = BuildingCountComponent(
      getAddressById(world.components(), BuildingCountComponentID)
    );
    return LibMath.getSafe(maxBuildingsComponent, playerEntity);
  }

  function getMaxBuildingCount(IWorld world, uint256 baseLevel) internal view returns (uint32) {
    MaxBuildingsComponent maxBuildingsComponent = MaxBuildingsComponent(
      getAddressById(world.components(), MaxBuildingsComponentID)
    );
    if (maxBuildingsComponent.has(baseLevel)) return maxBuildingsComponent.getValue(baseLevel);
    else revert("Invalid Base Level");
  }

  function isMainBase(uint256 tileId) internal pure returns (bool) {
    return tileId == MainBaseID;
  }
}
