// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/World.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { ResourceValue, ResourceValues } from "../types.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetBuildingReqs {
  function setResourceReqs(IWorld world, uint256 buildingType, ResourceValue[] memory resourceValues) internal {
    ResourceValues memory resources;
    resources.resources = new uint256[](resourceValues.length);
    resources.values = new uint32[](resourceValues.length);
    for (uint256 i = 0; i < resourceValues.length; i++) {
      resources.resources[i] = resourceValues[i].resource;
      resources.values[i] = resourceValues[i].value;
    }
    RequiredResourcesComponent(world.getComponent(RequiredResourcesComponentID)).set(buildingType, resources);
  }

  function setStorageUpgrades(IWorld world, uint256 buildingType, ResourceValue[] memory resourceValues) internal {
    uint256[] memory resources = new uint256[](resourceValues.length);
    for (uint256 i = 0; i < resourceValues.length; i++) {
      resources[i] = resourceValues[i].resource;
      MaxStorageComponent(world.getComponent(MaxStorageComponentID)).set(
        LibEncode.hashKeyEntity(resourceValues[i].resource, buildingType),
        resourceValues[i].value
      );
    }
    MaxResourceStorageComponent(world.getComponent(MaxResourceStorageComponentID)).set(buildingType, resources);
  }
}
