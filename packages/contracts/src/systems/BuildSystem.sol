// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/System.sol";
import { PrimodiumSystem } from "./internal/PrimodiumSystem.sol";
import { addressToEntity } from "solecs/utils.sol";

// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

// prototpyes
import { PlatingFactoryID, MainBaseID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID, SiloID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

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
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID));

    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);

    performChecks(entity, buildingType, playerEntity);

    if (buildingType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(playerEntity, coord);
      }
    }

    //set MainBase id for player address for easy lookup
    if (buildingType == MainBaseID) {
      buildingComponent.set(playerEntity, entity);
    }

    // update building count if the built building counts towards the build limit
    if (LibBuilding.doesTileCountTowardsBuildingLimit(ignoreBuildLimitComponent, buildingType)) {
      BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) + 1);
    }
    //set level of building to 1
    buildingComponent.set(entity, 1);

    TileComponent(getC(TileComponentID)).set(entity, buildingType);
    OwnedByComponent(getC(OwnedByComponentID)).set(entity, playerEntity);
    LastBuiltAtComponent(getC(LastBuiltAtComponentID)).set(entity, block.number);

    return abi.encode(entity);
  }

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function performChecks(uint256 entity, uint256 buildingType, uint256 playerEntity) private {
    require(!TileComponent(getC(TileComponentID)).has(entity), "[BuildSystem] Cannot build on a non-empty coordinate");

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
      LibBuilding.checkBuildLimitConditionForBuildingId(
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
      LibDebug.isDebug() &&
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
}
