// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

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
