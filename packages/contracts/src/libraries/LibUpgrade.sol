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
    require(
      resourceRequirementsComponent.has(LibEncode.hashFromKey(buildingId, currentLevel + 1)),
      "[LibUpgrade] Resource Requirements do not exist for this building level"
    );
    uint256[] memory resourceRequirements = resourceRequirementsComponent.getValue(
      LibEncode.hashFromKey(buildingId, currentLevel + 1)
    );
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromTwoKeys(resourceRequirements[i], buildingId, currentLevel + 1)
      );
      if (
        resourceCost >
        LibMath.getSafeUint256Value(itemComponent, LibEncode.hashKeyEntity(resourceRequirements[i], playerEntity))
      ) return false;
    }
    return true;
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
    uint256 currentLevel = buildingComponent.getValue(buildingEntity);
    require(
      resourceRequirementsComponent.has(LibEncode.hashFromKey(buildingId, currentLevel + 1)),
      "[LibUpgrade] Resource Requirements do not exist for this building level"
    );
    uint256[] memory resourceRequirements = resourceRequirementsComponent.getValue(
      LibEncode.hashFromKey(buildingId, currentLevel + 1)
    );
    for (uint256 i = 0; i < resourceRequirements.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromTwoKeys(resourceRequirements[i], buildingId, currentLevel + 1)
      );
      uint256 curItem = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(resourceRequirements[i], playerEntity)
      );
      itemComponent.set(LibEncode.hashKeyEntity(resourceRequirements[i], playerEntity), curItem - resourceCost);
    }
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
}
