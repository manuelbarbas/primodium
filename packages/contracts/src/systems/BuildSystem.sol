// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/System.sol";
import { PrimodiumSystem } from "./internal/PrimodiumSystem.sol";
import { addressToEntity } from "solecs/utils.sol";

// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

// prototpyes
import { PlatingFactoryID, MainBaseID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID, SiloID } from "../prototypes/Tiles.sol";
import { BuildingTileKey, BuildingKey } from "../prototypes/Keys.sol";

// libraries
import { Coord } from "../types.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    uint256 playerEntity = addressToEntity(msg.sender);
    BuildingComponent buildingComponent = BuildingComponent(getC(BuildingComponentID));
    BlueprintComponent blueprintComponent = BlueprintComponent(getC(BlueprintComponentID));
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID));

    uint256 buildingEntity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    performChecks(buildingType, playerEntity);

    int32[] memory blueprint = blueprintComponent.getValue(buildingType);

    uint256[] memory blocks = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1]);
      blocks[i / 2] = placeBuildingBlock(buildingEntity, buildingType, coord, relativeCoord);
    }
    BuildingTilesComponent(getC(BuildingTilesComponentID)).set(buildingEntity, blocks);

    if (buildingType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(playerEntity, buildingEntity);
      }
    }

    //set MainBase id for player address for easy lookup
    if (buildingType == MainBaseID) {
      buildingComponent.set(playerEntity, buildingEntity);
    }

    // update building count if the built building counts towards the build limit
    if (!ignoreBuildLimitComponent.has(buildingType)) {
      BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) + 1);
    }
    //set level of building to 1
    buildingComponent.set(buildingEntity, 1);

    OwnedByComponent(getC(OwnedByComponentID)).set(buildingEntity, playerEntity);
    LastBuiltAtComponent(getC(LastBuiltAtComponentID)).set(buildingEntity, block.number);

    return abi.encode(buildingEntity);
  }

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function performChecks(uint256 buildingType, uint256 playerEntity) private {
    require(
      BlueprintComponent(getC(BlueprintComponentID)).has(buildingType),
      "[BuildSystem] building type must have a blueprint"
    );

    //check required research
    require(
      LibBuilding.checkResearchReqs(world, buildingType),
      "[BuildSystem] You have not researched the required Technology"
    );

    //check resource requirements and if ok spend required resources
    require(
      LibBuilding.checkAndSpendResourceReqs(world, buildingType),
      "[BuildSystem] You do not have the required resources"
    );

    //check build limit
    require(
      LibBuilding.isBuildLimitMet(
        IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)),
        BuildingLimitComponent(getC(BuildingLimitComponentID)),
        BuildingComponent(getC(BuildingComponentID)),
        playerEntity,
        buildingType
      ),
      "[BuildSystem] build limit reached. upgrade main base or destroy buildings"
    );

    // debug buildings are free:  DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (
      !LibDebug.isDebug() &&
      (buildingType == DebugNodeID ||
        buildingType == MinerID ||
        buildingType == LithiumMinerID ||
        buildingType == BulletFactoryID ||
        buildingType == DebugPlatingFactoryID ||
        buildingType == SiloID)
    ) {
      // debug buildings, do nothing
      revert("[BuildSystem] Debug buildings are not allowed to be built");
    }
  }

  function placeBuildingBlock(
    uint256 buildingEntity,
    uint256 buildingType,
    Coord memory baseCoord,
    Coord memory relativeCoord
  ) private returns (uint256 blockEntity) {
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    Coord memory coord = Coord(baseCoord.x + relativeCoord.x, baseCoord.y + relativeCoord.y);
    blockEntity = LibEncode.encodeCoordEntity(coord, BuildingTileKey);
    require(!tileComponent.has(blockEntity), "[BuildSystem] Cannot build on a non-empty coordinate");
    tileComponent.set(blockEntity, buildingType);
    OwnedByComponent(getC(OwnedByComponentID)).set(blockEntity, buildingEntity);
  }
}
