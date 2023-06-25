// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

library LibResourceCost {
  function hasRequiredResources(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    address playerAddress
  ) internal view returns (bool) {
    if (!requiredResourcesComponent.has(entity)) return true;

    uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(requiredResources[i], entity)
      );
      if (
        resourceCost >
        LibMath.getSafeUint256Value(itemComponent, LibEncode.hashFromAddress(requiredResources[i], playerAddress))
      ) return false;
    }
    return true;
  }

  function spendRequiredResources(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    address playerAddress
  ) internal {
    if (!requiredResourcesComponent.has(entity)) return;
    uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(requiredResources[i], entity)
      );
      uint256 curItem = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromAddress(requiredResources[i], playerAddress)
      );
      itemComponent.set(LibEncode.hashFromAddress(requiredResources[i], playerAddress), curItem - resourceCost);
    }
  }
}
