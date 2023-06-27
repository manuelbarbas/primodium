pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID, MinerID } from "../prototypes/Tiles.sol";

import { BasicMinerID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { LibDebug } from "libraries/LibDebug.sol";

import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibResearch } from "libraries/LibResearch.sol";
import { LibResourceCost } from "libraries/LibResourceCost.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

library LibUpgrade {
  function checkUpgradeResourceRequirements(
    Uint256Component buildingComponent,
    Uint256ArrayComponent resourceRequirementsComponent,
    Uint256Component itemComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal view returns (bool) {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 currentLevel = buildingComponent.getValue(buildingEntity);
    uint256 buildingIdLevel = LibEncode.hashFromKey(buildingId, currentLevel + 1);
    return
      LibResourceCost.hasRequiredResources(resourceRequirementsComponent, itemComponent, buildingIdLevel, playerEntity);
  }

  function checkAndSpendUpgradeResourceRequirements(
    Uint256Component buildingComponent,
    Uint256ArrayComponent resourceRequirementsComponent,
    Uint256Component itemComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal returns (bool) {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 currentLevel = buildingComponent.getValue(buildingEntity);
    require(currentLevel > 0, "[LibUpgrade] can not upgrade building that is level 0");
    uint256 buildingIdLevel = LibEncode.hashFromKey(buildingId, currentLevel + 1);
    return
      LibResourceCost.checkAndSpendRequiredResources(
        resourceRequirementsComponent,
        itemComponent,
        buildingIdLevel,
        playerEntity
      );
  }

  function spendUpgradeResourceRequirements(
    Uint256Component buildingComponent,
    Uint256ArrayComponent resourceRequirementsComponent,
    Uint256Component itemComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 buildingIdLevel = LibEncode.hashFromKey(buildingId, buildingComponent.getValue(buildingEntity) + 1);
    LibResourceCost.spendRequiredResources(resourceRequirementsComponent, itemComponent, buildingIdLevel, playerEntity);
  }

  function checkUpgradeResearchRequirements(
    Uint256Component buildingComponent,
    Uint256Component researchRequirmentComponent,
    BoolComponent researchComponent,
    uint256 buildingId,
    uint256 buildingEntity,
    uint256 playerEntity
  ) internal view returns (bool) {
    require(buildingComponent.has(buildingEntity), "[LibUpgrade] can not upgrade building that does not exist");
    uint256 currentLevel = buildingComponent.getValue(buildingEntity);
    if (!researchRequirmentComponent.has(LibEncode.hashFromKey(buildingId, currentLevel + 1))) return true;
    uint256 researchRequirement = researchRequirmentComponent.getValue(
      LibEncode.hashFromKey(buildingId, currentLevel + 1)
    );
    return LibResearch.hasResearchedWithKey(researchComponent, researchRequirement, playerEntity);
  }

  function set1RequiredResourceForEntityLevel(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibResourceCost.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1
    );
  }

  function set2RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibResourceCost.set2RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2
    );
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
    uint256 resourceCost3,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibResourceCost.set3RequiredResourcesForEntity(
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
    uint256 resourceCost4,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibResourceCost.set4RequiredResourcesForEntity(
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
