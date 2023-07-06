// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

import { LithiumMineID, IronMineID, CopperMineID, TitaniumMineID, IridiumMineID, OsmiumMineID, TungstenMineID, KimberliteMineID, UraniniteMineID, BolutiteMineID } from "../prototypes/Tiles.sol";

library LibMineDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();

    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    MaxLevelComponent maxLevelComponent = MaxLevelComponent(getAddressById(components, MaxLevelComponentID));
    //IronMineID
    tileComponent.set(IronMineID, IronResourceItemID);
    maxLevelComponent.set(IronMineID, 3);
    //IronMineID Level 1
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
    //IronMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    //IronMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(IronMineID, 3);
    mineComponent.set(buildingIdLevel, 3);

    //CopperMineID
    tileComponent.set(CopperMineID, CopperResourceItemID);
    maxLevelComponent.set(CopperMineID, 3);
    //CopperMineID Level 1
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 1);
    mineComponent.set(buildingIdLevel, 1);
    //CopperMineID Level 2
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 2);
    mineComponent.set(buildingIdLevel, 2);
    //CopperMineID Level 3
    buildingIdLevel = LibEncode.hashKeyEntity(CopperMineID, 3);
    mineComponent.set(buildingIdLevel, 3);
  }
}
