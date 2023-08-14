// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { getAddressById } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

//components
import { P_IgnoreBuildLimitComponent, ID as P_IgnoreBuildLimitComponentID } from "components/P_IgnoreBuildLimitComponent.sol";
import { P_RequiredTileComponent, ID as P_RequiredTileComponentID } from "components/P_RequiredTileComponent.sol";

import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_MaxBuildingsComponent, ID as P_MaxBuildingsComponentID } from "components/P_MaxBuildingsComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";

import { Coord } from "../types.sol";
import { LibMath } from "libraries/LibMath.sol";

import { LibTerrain } from "./LibTerrain.sol";

library LibBuilding {
  function isMaxBuildingsMet(IWorld world, uint256 playerEntity, uint256 buildingId) internal view returns (bool) {
    if (P_IgnoreBuildLimitComponent(getAddressById(world.components(), P_IgnoreBuildLimitComponentID)).has(buildingId))
      return true;
    uint32 baseLevel = getBaseLevel(world, playerEntity);
    uint32 buildCountLimit = getMaxBuildingCount(world, baseLevel);
    uint32 buildingCount = getBuildingCount(world, playerEntity);
    return buildingCount < buildCountLimit;
  }

  function canBuildOnTile(IWorld world, uint256 buildingType, Coord memory coord) internal view returns (bool) {
    P_RequiredTileComponent requiredTileComponent = P_RequiredTileComponent(
      getAddressById(world.components(), P_RequiredTileComponentID)
    );
    return
      !requiredTileComponent.has(buildingType) ||
      requiredTileComponent.getValue(buildingType) == LibTerrain.getResourceByCoord(world, coord);
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
    P_MaxBuildingsComponent maxBuildingsComponent = P_MaxBuildingsComponent(
      getAddressById(world.components(), P_MaxBuildingsComponentID)
    );
    if (maxBuildingsComponent.has(baseLevel)) return maxBuildingsComponent.getValue(baseLevel);
    else revert("Invalid Base Level");
  }
}
