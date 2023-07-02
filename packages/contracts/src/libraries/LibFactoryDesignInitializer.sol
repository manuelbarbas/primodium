// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

// production buildings
import { PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

import { LithiumMineID, IronMineID, CopperMineID, TitaniumMineID, IridiumMineID, OsmiumMineID, TungstenMineID, KimberliteMineID, UraniniteMineID, BolutiteMineID } from "../prototypes/Tiles.sol";

library LibFactoryDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();

    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    //PlatingFactoryID
    //PlatingFactoryID Level 1
    uint256 buildingIdLevel = LibEncode.hashFromKey(PlatingFactoryID, 1);
    FactoryMineBuildingsData memory factoryMineBuildingsData;
    factoryMineBuildingsData.MineBuildingCount = new uint256[](1);
    factoryMineBuildingsData.MineBuildingCount[0] = 1;
    factoryMineBuildingsData.MineBuildingIDs = new uint256[](1);
    factoryMineBuildingsData.MineBuildingIDs[0] = IronMineID;
    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);

    factoryProductionComponent.set(buildingIdLevel, FactoryProductionData(IronPlateCraftedItemID, 1));

    //PlatingFactoryID Level 2
    buildingIdLevel = LibEncode.hashFromKey(PlatingFactoryID, 2);
    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);

    factoryProductionComponent.set(buildingIdLevel, FactoryProductionData(IronPlateCraftedItemID, 2));
  }
}
