// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";

import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
// debug buildings
import { PlatingFactoryID, MainBaseID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID, SiloID } from "../prototypes/Tiles.sol";

import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkResearchRequirements(uint256 blockType) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    return
      !requiredResearchComponent.has(blockType) ||
      LibResearch.hasResearchedWithKey(
        researchComponent,
        requiredResearchComponent.getValue(blockType),
        addressToEntity(msg.sender)
      );
  }

  function checkResourceRequirements(uint256 blockType) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    return
      LibResourceCost.hasRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkAndSpendResourceRequirements(uint256 blockType) internal returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    return
      LibResourceCost.checkAndSpendRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function spendRequiredResources(uint256 blockType) internal {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    LibResourceCost.spendRequiredResources(
      requiredResourcesComponent,
      itemComponent,
      blockType,
      addressToEntity(msg.sender)
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(components, BuildingLimitComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );
    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(!tileComponent.has(entity), "[BuildSystem] Cannot build on a non-empty coordinate");

    //check required research
    require(checkResearchRequirements(blockType), "[BuildSystem] You have not researched the required Technology");

    //check required resources
    require(
      LibBuilding.checkBuildLimitConditionForBuildingId(
        ignoreBuildLimitComponent,
        buildingLimitComponent,
        buildingComponent,
        addressToEntity(msg.sender),
        blockType
      ),
      "[BuildSystem] build limit reached. upgrade main base or destroy buildings"
    );

    //require(checkResourceRequirements(blockType), "[BuildSystem] You do not have the required resources");

    //check if counts towards build limit and if so, check if limit is reached

    // Check if the player has enough resources to build
    // debug buildings are free:  DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (
      blockType == DebugNodeID ||
      blockType == MinerID ||
      blockType == LithiumMinerID ||
      blockType == BulletFactoryID ||
      blockType == DebugPlatingFactoryID ||
      blockType == SiloID
    ) {
      // debug buildings, do nothing
      if (!LibDebug.isDebug()) {
        revert("[BuildSystem] Debug buildings are not allowed to be built");
      }
    } else if (blockType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(addressToEntity(msg.sender))) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(addressToEntity(msg.sender), coord);
      }
    }

    //spend required resources
    //spendRequiredResources(blockType);
    require(checkAndSpendResourceRequirements(blockType), "[BuildSystem] You do not have the required resources");
    if (blockType == MainBaseID) {
      buildingComponent.set(addressToEntity(msg.sender), entity);
    }
    if (LibBuilding.doesTileCountTowardsBuildingLimit(ignoreBuildLimitComponent, blockType)) {
      buildingLimitComponent.set(
        addressToEntity(msg.sender),
        LibMath.getSafeUint256Value(buildingLimitComponent, addressToEntity(msg.sender)) + 1
      );
    }
    buildingComponent.set(entity, 1);
    tileComponent.set(entity, blockType);
    ownedByComponent.set(entity, addressToEntity(msg.sender));
    lastBuiltAtComponent.set(entity, block.number);

    return abi.encode(entity);
  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(blockType, coord));
  }
}
