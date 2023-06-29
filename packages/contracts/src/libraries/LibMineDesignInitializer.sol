// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

import { LithiumMineID, IronMineID, CopperMineID, TitaniumMineID, IridiumMineID, OsmiumMineID, TungstenMineID, KimberliteMineID, UraniniteMineID, BolutiteMineID } from "../prototypes/Tiles.sol";

library LibMineDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();

    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    //IronMineID
    tileComponent.set(IronMineID, IronResourceItemID);
    //IronMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashFromKey(IronMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
    //IronMineID Level 2
    buildingIdLevel = LibEncode.hashFromKey(IronMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    //IronMineID Level 3
    buildingIdLevel = LibEncode.hashFromKey(IronMineID, 3);
    mineComponent.set(buildingIdLevel, 3);

    //CopperMineID
    tileComponent.set(CopperMineID, CopperResourceItemID);

    //CopperMineID Level 1
    buildingIdLevel = LibEncode.hashFromKey(CopperMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
    //CopperMineID Level 2
    buildingIdLevel = LibEncode.hashFromKey(CopperMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    //CopperMineID Level 3
    buildingIdLevel = LibEncode.hashFromKey(CopperMineID, 3);
    mineComponent.set(buildingIdLevel, 3);
  }
}
