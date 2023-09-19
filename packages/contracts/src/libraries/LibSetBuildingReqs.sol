// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/World.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";

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
    P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID)).set(buildingType, resources);
  }

  function setResourceReqs(IWorld world, uint256 buildingType, ResourceValues memory resourceValues) internal {
    P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID)).set(buildingType, resourceValues);
  }

  function setStorageUpgrades(IWorld world, uint256 buildingType, ResourceValue[] memory resourceValues) internal {
    uint256[] memory resources = new uint256[](resourceValues.length);
    for (uint256 i = 0; i < resourceValues.length; i++) {
      resources[i] = resourceValues[i].resource;
      P_MaxStorageComponent(world.getComponent(P_MaxStorageComponentID)).set(
        LibEncode.hashKeyEntity(resourceValues[i].resource, buildingType),
        resourceValues[i].value
      );
    }
    P_MaxResourceStorageComponent(world.getComponent(P_MaxResourceStorageComponentID)).set(buildingType, resources);
  }
}
