// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
// Production Buildings
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";

import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, PassiveResourceProductionData } from "components/PassiveResourceProductionComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID, RequiredPassiveResourceData } from "components/RequiredPassiveResourceComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";

import "../prototypes.sol";
import { LibBlueprint } from "../libraries/LibBlueprint.sol";
import { BuildingPrototype, ResourceCost } from "../types.sol";

uint32 constant NONE = 0;

library LibInitBuildingPrototypes {
  function initBuilding(IWorld world, uint256 buildingType, BuildingPrototype memory prototype) internal {
    if (prototype.requiredTile != NONE)
      RequiredTileComponent(world.getComponent(RequiredTileComponentID)).set(buildingType, prototype.requiredTile);

    MaxLevelComponent(world.getComponent(MaxLevelComponentID)).set(buildingType, prototype.maxLevel);

    // passive production
    if (prototype.passiveResource != NONE && prototype.passiveRate != NONE) {
      PassiveResourceProductionComponent(world.getComponent(PassiveResourceProductionComponentID)).set(
        buildingType,
        PassiveResourceProductionData(prototype.passiveResource, prototype.passiveRate)
      );
    }

    //passive requirements
    if (prototype.requiredPassiveResources.length != NONE) {
      RequiredPassiveResourceComponent(world.getComponent(RequiredPassiveResourceComponentID)).set(
        buildingType,
        RequiredPassiveResourceData(prototype.requiredPassiveResources, prototype.requiredPassiveCounts)
      );
    }

    BlueprintComponent(world.getComponent(BlueprintComponentID)).set(buildingType, prototype.blueprint);

    // upgrade requirements
    for (uint256 i = 0; i < prototype.maxLevel; i++) {
      uint256 level = i + 1;
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, level);

      MineComponent(world.getComponent(MineComponentID)).set(buildingLevelEntity, prototype.productionRates[i]);
      RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(
        buildingLevelEntity,
        prototype.requiredResearch[i]
      );
      ResourceCost[] memory resourceCosts = prototype.requiredResources[i];
      LibSetBuildingReqs.setUpgradeResourceReqs(world, buildingType, level, resourceCosts);
    }
  }

  function ironMinePrototype() internal pure returns (BuildingPrototype memory prototype) {
    uint32 maxLevel = 3;

    uint256[] memory requiredResearch = new uint256[](maxLevel);
    uint32[] memory productionRates = new uint32[](maxLevel);
    ResourceCost[][] memory requiredResources = new ResourceCost[][](maxLevel);

    // level 1
    productionRates[0] = 5;

    // level 2
    productionRates[1] = 7;
    requiredResearch[1] = IronMine2ResearchID;

    ResourceCost[] memory resourceCosts = new ResourceCost[](1);
    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 800 });
    requiredResources[1] = resourceCosts;

    // level 3
    requiredResearch[2] = IronMine3ResearchID;
    productionRates[2] = 10;

    resourceCosts[0] = ResourceCost({ resource: CopperResourceItemID, cost: 1500 });
    requiredResources[2] = resourceCosts;
    //IronMineID Level 2

    return
      BuildingPrototype({
        maxLevel: maxLevel,
        requiredTile: IronResourceItemID,
        passiveResource: NONE,
        passiveRate: NONE,
        blueprint: LibBlueprint.get1x1Blueprint(),
        requiredResearch: requiredResearch,
        productionRates: productionRates,
        requiredPassiveResources: new uint256[](0),
        requiredPassiveCounts: new uint32[](0),
        requiredResources: requiredResources
      });
  }

  function copperMinePrototype() internal pure returns (BuildingPrototype memory prototype) {
    uint32 maxLevel = 3;

    uint256[] memory requiredResearch = new uint256[](maxLevel);
    uint32[] memory productionRates = new uint32[](maxLevel);
    ResourceCost[][] memory requiredResources = new ResourceCost[][](maxLevel);

    // level 1
    productionRates[0] = 3;
    requiredResearch[0] = CopperMineResearchID;

    ResourceCost[] memory resourceCosts = new ResourceCost[](1);
    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 500 });
    requiredResources[0] = resourceCosts;

    // level 2
    productionRates[1] = 5;
    requiredResearch[1] = CopperMine2ResearchID;

    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 1500 });
    requiredResources[1] = resourceCosts;

    // level 3
    requiredResearch[2] = CopperMine3ResearchID;
    productionRates[2] = 7;

    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 1500 });
    requiredResources[2] = resourceCosts;

    return
      BuildingPrototype({
        maxLevel: maxLevel,
        requiredTile: CopperResourceItemID,
        passiveResource: NONE,
        passiveRate: NONE,
        blueprint: LibBlueprint.get1x1Blueprint(),
        requiredResearch: requiredResearch,
        productionRates: productionRates,
        requiredPassiveResources: new uint256[](0),
        requiredPassiveCounts: new uint32[](0),
        requiredResources: requiredResources
      });
  }

  function lithiumMinePrototype() internal pure returns (BuildingPrototype memory prototype) {
    uint32 maxLevel = 2;

    uint256[] memory requiredResearch = new uint256[](maxLevel);
    uint32[] memory productionRates = new uint32[](maxLevel);
    ResourceCost[][] memory requiredResources = new ResourceCost[][](maxLevel);

    // level 1
    productionRates[0] = 2;
    requiredResearch[0] = LithiumMineResearchID;

    ResourceCost[] memory resourceCosts = new ResourceCost[](1);
    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 1500 });
    requiredResources[0] = resourceCosts;

    // level 2
    productionRates[1] = 3;
    requiredResearch[1] = LithiumMine2ResearchID;

    resourceCosts[0] = ResourceCost({ resource: IronPlateCraftedItemID, cost: 700 });
    requiredResources[1] = resourceCosts;

    return
      BuildingPrototype({
        maxLevel: maxLevel,
        requiredTile: LithiumResourceItemID,
        passiveResource: NONE,
        passiveRate: NONE,
        blueprint: LibBlueprint.get1x1Blueprint(),
        requiredResearch: requiredResearch,
        productionRates: productionRates,
        requiredPassiveResources: new uint256[](0),
        requiredPassiveCounts: new uint32[](0),
        requiredResources: requiredResources
      });
  }

  function storageUnitPrototype() internal pure returns (BuildingPrototype memory prototype) {
    uint32 maxLevel = 3;

    uint256[] memory requiredResearch = new uint256[](0);
    uint32[] memory productionRates = new uint32[](0);
    uint256[] memory passiveResources = new uint256[](0);
    uint32[] memory passiveCounts = new uint32[](0);

    ResourceCost[][] memory requiredResources = new ResourceCost[][](maxLevel);

    // level 1
    requiredResearch[0] = LithiumMineResearchID;

    ResourceCost[] memory resourceCosts = new ResourceCost[](1);
    resourceCosts[0] = ResourceCost({ resource: IronResourceItemID, cost: 1500 });
    requiredResources[0] = resourceCosts;

    // level 2
    productionRates[1] = 3;
    requiredResearch[1] = LithiumMine2ResearchID;

    resourceCosts[0] = ResourceCost({ resource: IronPlateCraftedItemID, cost: 700 });
    requiredResources[1] = resourceCosts;

    return
      BuildingPrototype({
        maxLevel: maxLevel,
        requiredTile: LithiumResourceItemID,
        passiveResource: NONE,
        passiveRate: NONE,
        blueprint: LibBlueprint.get1x1Blueprint(),
        requiredResearch: requiredResearch,
        productionRates: productionRates,
        requiredPassiveResources: passiveResources,
        requiredPassiveCounts: passiveCounts,
        requiredResources: requiredResources
      });
  }

  function init(IWorld world) internal {
    initBuilding(world, IronMineID, ironMinePrototype());
  }
}
