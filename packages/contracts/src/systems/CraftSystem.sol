// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";

// Debug Buildings
import { BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";

// Production Buildings
import { PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// resources
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

// item keys
// Resources
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibCraft } from "libraries/LibCraft.sol";
import { LibMine } from "libraries/LibMine.sol";
import { LibEncode } from "libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.Craft"));

contract CraftSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    Coord memory coord = abi.decode(args, (Coord));
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(c.tileComponent.has(entity), "[CraftSystem] Cannot craft at an empty coordinate");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[CraftSystem] Cannot craft at a tile you do not own"
    );

    // Check that health is not zero
    require(LibHealth.checkAlive(c.healthComponent, entity), "[CraftSystem] Cannot craft at a tile with zero health");

    // debug
    // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
    if (c.tileComponent.getValue(entity) == BulletFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        IronResourceItemID,
        1,
        CopperResourceItemID,
        1,
        BulletCraftedItemID,
        entity
      );
    }
    // Craft 1 IronPlate with 1 IronResource and 1 CopperResource in DebugPlatingFactory
    else if (c.tileComponent.getValue(entity) == DebugPlatingFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        IronResourceItemID,
        1,
        CopperResourceItemID,
        1,
        IronPlateCraftedItemID,
        entity
      );
    }
    // production
    // Craft 1 IronPlate with 10 IronResource in PlatingFactory
    else if (c.tileComponent.getValue(entity) == PlatingFactoryID) {
      LibCraft.craftWithOneItem(itemComponent, IronResourceItemID, 10, IronPlateCraftedItemID, entity);
    }
    // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
    else if (c.tileComponent.getValue(entity) == BasicBatteryFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        LithiumResourceItemID,
        100,
        IronResourceItemID,
        20,
        BasicPowerSourceCraftedItemID,
        entity
      );
    }
    // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
    else if (c.tileComponent.getValue(entity) == KineticMissileFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        BasicPowerSourceCraftedItemID,
        10,
        TitaniumResourceItemID,
        20,
        KineticMissileCraftedItemID,
        entity
      );
    }
    // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
    else if (c.tileComponent.getValue(entity) == DenseMetalRefineryID) {
      LibCraft.craftWithOneItem(itemComponent, OsmiumResourceItemID, 10, RefinedOsmiumCraftedItemID, entity);
    }
    // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
    else if (c.tileComponent.getValue(entity) == AdvancedBatteryFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        RefinedOsmiumCraftedItemID,
        10,
        BasicPowerSourceCraftedItemID,
        2,
        AdvancedPowerSourceCraftedItemID,
        entity
      );
    }
    // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
    else if (c.tileComponent.getValue(entity) == PenetratorFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        RefinedOsmiumCraftedItemID,
        20,
        AdvancedPowerSourceCraftedItemID,
        5,
        PenetratingWarheadCraftedItemID,
        entity
      );
    }
    // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
    else if (c.tileComponent.getValue(entity) == PenetratingMissileFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        PenetratingWarheadCraftedItemID,
        1,
        KineticMissileCraftedItemID,
        1,
        PenetratingMissileCraftedItemID,
        entity
      );
    }
    // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
    else if (c.tileComponent.getValue(entity) == HighTempFoundryID) {
      LibCraft.craftWithOneItem(itemComponent, TungstenResourceItemID, 10, TungstenRodsCraftedItemID, entity);
    }
    // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
    else if (c.tileComponent.getValue(entity) == PrecisionMachineryFactoryID) {
      LibCraft.craftWithOneItem(itemComponent, IridiumResourceItemID, 10, IridiumCrystalCraftedItemID, entity);
    }
    // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
    else if (c.tileComponent.getValue(entity) == IridiumDrillbitFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        IridiumCrystalCraftedItemID,
        5,
        TungstenRodsCraftedItemID,
        10,
        IridiumDrillbitCraftedItemID,
        entity
      );
    }
    // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
    else if (c.tileComponent.getValue(entity) == HighEnergyLaserFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        IridiumCrystalCraftedItemID,
        10,
        AdvancedPowerSourceCraftedItemID,
        5,
        LaserPowerSourceCraftedItemID,
        entity
      );
    }
    // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
    else if (c.tileComponent.getValue(entity) == ThermobaricWarheadFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        IridiumDrillbitCraftedItemID,
        1,
        LaserPowerSourceCraftedItemID,
        1,
        ThermobaricWarheadCraftedItemID,
        entity
      );
    }
    // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
    else if (c.tileComponent.getValue(entity) == ThermobaricMissileFactoryID) {
      LibCraft.craftWithTwoItems(
        itemComponent,
        PenetratingMissileCraftedItemID,
        10,
        ThermobaricWarheadCraftedItemID,
        1,
        ThermobaricMissileCraftedItemID,
        entity
      );
    }
    // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
    else if (c.tileComponent.getValue(entity) == KimberliteCatalystFactoryID) {
      LibCraft.craftWithOneItem(
        itemComponent,
        KimberliteResourceItemID,
        10,
        KimberliteCrystalCatalystCraftedItemID,
        entity
      );
    } else {
      revert("[CraftSystem] Cannot craft from a non-factory tile");
    }

    // TODO: gracefully exit

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
