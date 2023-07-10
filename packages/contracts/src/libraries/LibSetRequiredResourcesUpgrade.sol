pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { addressToEntity } from "solecs/utils.sol";
import { LibSetRequiredResources } from "./LibSetRequiredResources.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetRequiredResourcesUpgrade {
  function set1RequiredResourcesForEntityUpgradeToLevel(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1
    );
  }

  function set2RequiredResourcesForEntityUpgradeToLevel(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2
    );
  }

  function set3RequiredResourcesForEntityUpgradeToLevel(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2,
      resourceId3,
      resourceCost3
    );
  }

  function set4RequiredResourcesForEntityUpgradeToLevel(
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
    uint256 resourceCost4,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2,
      resourceId3,
      resourceCost3,
      resourceId4,
      resourceCost4
    );
  }
}
