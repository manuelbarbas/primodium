pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetRequiredResources {
  function set1RequiredResourceForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1
  ) internal {
    uint256[] memory resourceIds = new uint256[](1);
    resourceIds[0] = resourceId1;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
  }

  function set2RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2
  ) internal {
    uint256[] memory resourceIds = new uint256[](2);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
  }

  function set3RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3
  ) internal {
    uint256[] memory resourceIds = new uint256[](3);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    resourceIds[2] = resourceId3;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
    itemComponent.set(LibEncode.hashFromKey(resourceId3, entity), resourceCost3);
  }

  function set4RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3,
    uint256 resourceId4,
    uint256 resourceCost4
  ) internal {
    uint256[] memory resourceIds = new uint256[](4);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    resourceIds[2] = resourceId3;
    resourceIds[3] = resourceId4;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
    itemComponent.set(LibEncode.hashFromKey(resourceId3, entity), resourceCost3);
    itemComponent.set(LibEncode.hashFromKey(resourceId4, entity), resourceCost4);
  }
}
