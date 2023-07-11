// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

//components
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibMath } from "libraries/LibMath.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { LibTerrain } from "./LibTerrain.sol";
import { LibEncode } from "./LibEncode.sol";

library LibBuilding {
  function meetsBuildCondition(
    BoolComponent ignoreBuildLimitComponent,
    Uint256Component buildingLimitComponent,
    Uint256Component buildingLevelComponent,
    Uint256Component mainBaseBuildingEntityComponent,
    uint256 playerEntity,
    uint256 buildingId
  ) internal view returns (bool) {
    return
      ignoreBuildLimitComponent.has(buildingId) ||
      isBuildingCountWithinLimit(
        buildingLimitComponent,
        buildingLevelComponent,
        mainBaseBuildingEntityComponent,
        playerEntity
      );
  }

  function isBuildingLimitMet(
    BoolComponent ignoreBuildLimitComponent,
    Uint256Component buildingLimitComponent,
    Uint256Component buildingLevelComponent,
    Uint256Component mainBaseComponent,
    uint256 playerEntity,
    uint256 buildingId
  ) internal view returns (bool) {
    return
      ignoreBuildLimitComponent.has(buildingId) ||
      isBuildingCountWithinLimit(buildingLimitComponent, buildingLevelComponent, mainBaseComponent, playerEntity);
  }

  function canBuildOnTile(
    Uint256Component tileComponent,
    uint256 buildingType,
    uint256 buildingEntity
  ) internal view returns (bool) {
    return
      !tileComponent.has(buildingType) ||
      tileComponent.getValue(buildingType) == LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(buildingEntity));
  }

  function isBuildingCountWithinLimit(
    Uint256Component buildingLimitComponent,
    Uint256Component buildingLevelComponent,
    Uint256Component mainBaseComponent,
    uint256 playerEntity
  ) internal view returns (bool) {
    uint256 baseLevel = getBaseLevel(buildingLimitComponent, buildingLevelComponent, mainBaseComponent, playerEntity);
    uint256 buildCountLimit = getBuildingCountLimit(buildingLimitComponent, baseLevel);
    uint256 buildingCount = getBuildingCount(buildingLimitComponent, playerEntity);
    return buildingCount < buildCountLimit;
  }

  function canBuildOnTile(
    Uint256Component tileComponent,
    uint256 buildingEntity,
    Coord memory coord
  ) internal view returns (bool) {
    return
      !tileComponent.has(buildingEntity) || tileComponent.getValue(buildingEntity) == LibTerrain.getTopLayerKey(coord);
  }

  function getBaseLevel(
    Uint256Component buildingComponent,
    Uint256Component buildingLevelComponent,
    Uint256Component mainBaseBuildingEntityComponent,
    uint256 playerEntity
  ) internal view returns (uint256) {
    return
      mainBaseBuildingEntityComponent.has(playerEntity)
        ? buildingLevelComponent.getValue(mainBaseBuildingEntityComponent.getValue(playerEntity))
        : 0;
  }

  function getBuildingCount(
    Uint256Component buildingLimitComponent,
    uint256 playerEntity
  ) internal view returns (uint256) {
    return LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity);
  }

  function getBuildingCountLimit(
    Uint256Component buildingLimitComponent,
    uint256 mainBuildingLevel
  ) internal view returns (uint256) {
    if (buildingLimitComponent.has(mainBuildingLevel)) return buildingLimitComponent.getValue(mainBuildingLevel);
    else revert("Invalid Main Building Level");
  }

  function isMainBase(uint256 tileId) internal pure returns (bool) {
    return tileId == MainBaseID;
  }
}
