// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/World.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { ResourceCost } from "../types.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetBuildingReqs {
  function setResourceReqs(IWorld world, uint256 buildingType, ResourceCost[] memory resourceCosts) internal {
    uint256[] memory resources = new uint256[](resourceCosts.length);
    for (uint256 i = 0; i < resources.length; i++) {
      resources[i] = resourceCosts[i].resource;
      ItemComponent(world.getComponent(ItemComponentID)).set(
        LibEncode.hashKeyEntity(resourceCosts[i].resource, buildingType),
        resourceCosts[i].cost
      );
    }
    RequiredResourcesComponent(world.getComponent(RequiredResourcesComponentID)).set(buildingType, resources);
  }

  function setUpgradeResourceReqs(
    IWorld world,
    uint256 entity,
    uint256 level,
    ResourceCost[] memory resourceCosts
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    setResourceReqs(world, buildingIdLevel, resourceCosts);
  }

  function setUpgradeResearchReqs(IWorld world, uint256 buildingType, uint256 research, uint256 level) internal {
    uint256 buildingLevel = LibEncode.hashKeyEntity(buildingType, level);
    RequiredResearchComponent(world.getComponent(RequiredResearchComponentID)).set(buildingLevel, research);
  }
}
