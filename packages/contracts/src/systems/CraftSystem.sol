// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ResourceComponents } from "../prototypes/ResourceComponents.sol";
import { CraftedComponents } from "../prototypes/CraftedComponents.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { ResourceResearchComponents } from "../prototypes/ResourceResearchComponents.sol";

// Resource Components
import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/OsmiumResourceComponent.sol";
import { TitaniumResourceComponent, ID as TitaniumResourceComponentID } from "components/TitaniumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/UraniniteResourceComponent.sol";

// Crafted Components
import { IronPlateCraftedComponent, ID as IronPlateCraftedComponentID } from "components/IronPlateCraftedComponent.sol";
import { BasicPowerSourceCraftedComponent, ID as BasicPowerSourceCraftedComponentID } from "components/BasicPowerSourceCraftedComponent.sol";
import { KineticMissileCraftedComponent, ID as KineticMissileCraftedComponentID } from "components/KineticMissileCraftedComponent.sol";
import { RefinedOsmiumCraftedComponent, ID as RefinedOsmiumCraftedComponentID } from "components/RefinedOsmiumCraftedComponent.sol";
import { AdvancedPowerSourceCraftedComponent, ID as AdvancedPowerSourceCraftedComponentID } from "components/AdvancedPowerSourceCraftedComponent.sol";
import { PenetratingWarheadCraftedComponent, ID as PenetratingWarheadCraftedComponentID } from "components/PenetratingWarheadCraftedComponent.sol";
import { PenetratingMissileCraftedComponent, ID as PenetratingMissileCraftedComponentID } from "components/PenetratingMissileCraftedComponent.sol";
import { TungstenRodsCraftedComponent, ID as TungstenRodsCraftedComponentID } from "components/TungstenRodsCraftedComponent.sol";
import { IridiumCrystalCraftedComponent, ID as IridiumCrystalCraftedComponentID } from "components/IridiumCrystalCraftedComponent.sol";
import { IridiumDrillbitCraftedComponent, ID as IridiumDrillbitCraftedComponentID } from "components/IridiumDrillbitCraftedComponent.sol";
import { LaserPowerSourceCraftedComponent, ID as LaserPowerSourceCraftedComponentID } from "components/LaserPowerSourceCraftedComponent.sol";
import { ThermobaricWarheadCraftedComponent, ID as ThermobaricWarheadCraftedComponentID } from "components/ThermobaricWarheadCraftedComponent.sol";
import { ThermobaricMissileCraftedComponent, ID as ThermobaricMissileCraftedComponentID } from "components/ThermobaricMissileCraftedComponent.sol";
import { KimberliteCrystalCatalystCraftedComponent, ID as KimberliteCrystalCatalystCraftedComponentID } from "components/KimberliteCrystalCatalystCraftedComponent.sol";

// Resource Research Components
import { CopperResearchComponent, ID as CopperResearchComponentID } from "components/CopperResearchComponent.sol";
import { LithiumResearchComponent, ID as LithiumResearchComponentID } from "components/LithiumResearchComponent.sol";
import { TitaniumResearchComponent, ID as TitaniumResearchComponentID } from "components/TitaniumResearchComponent.sol";
import { OsmiumResearchComponent, ID as OsmiumResearchComponentID } from "components/OsmiumResearchComponent.sol";
import { TungstenResearchComponent, ID as TungstenResearchComponentID } from "components/TungstenResearchComponent.sol";
import { IridiumResearchComponent, ID as IridiumResearchComponentID } from "components/IridiumResearchComponent.sol";
import { KimberliteResearchComponent, ID as KimberliteResearchComponentID } from "components/KimberliteResearchComponent.sol";

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

// Debug Buildings
import { MainBaseID, ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

// Production Buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// resources
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

// crafted

import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibCraft } from "libraries/LibCraft.sol";
import { LibMine } from "libraries/LibMine.sol";

uint256 constant ID = uint256(keccak256("system.Craft"));

contract CraftSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    Coord memory coord = abi.decode(arguments, (Coord));
    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not craft at empty coord");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    // Check that health is not zero
    require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health can not be zero");

    // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
    if (c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      BulletCraftedComponent bulletCraftedComponent = BulletCraftedComponent(
        getAddressById(components, BulletCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        copperResourceComponent,
        ironResourceComponent,
        1,
        1,
        bulletCraftedComponent,
        destination
      );
    }
    // Craft 1 IronPlate with 10 IronResource in PlatingFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PlatingFactoryID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithOneItem(ironResourceComponent, 10, ironPlateCraftedComponent, destination);
    }
    // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BasicBatteryFactoryID) {
      LithiumResourceComponent lithiumResourceComponent = LithiumResourceComponent(
        getAddressById(components, LithiumResourceComponentID)
      );
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        lithiumResourceComponent,
        ironResourceComponent,
        100,
        20,
        basicPowerSourceCraftedComponent,
        destination
      );
    }
    // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KineticMissileFactoryID) {
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      KineticMissileCraftedComponent kineticMissileCraftedComponent = KineticMissileCraftedComponent(
        getAddressById(components, KineticMissileCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        basicPowerSourceCraftedComponent,
        titaniumResourceComponent,
        10,
        20,
        kineticMissileCraftedComponent,
        destination
      );
    }
    // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == DenseMetalRefineryID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithOneItem(osmiumResourceComponent, 10, refinedOsmiumCraftedComponent, destination);
    }
    // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == AdvancedBatteryFactoryID) {
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        refinedOsmiumCraftedComponent,
        basicPowerSourceCraftedComponent,
        10,
        2,
        advancedPowerSourceCraftedComponent,
        destination
      );
    }
    // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratorFactoryID) {
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      PenetratingWarheadCraftedComponent penetratingWarheadCraftedComponent = PenetratingWarheadCraftedComponent(
        getAddressById(components, PenetratingWarheadCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        refinedOsmiumCraftedComponent,
        advancedPowerSourceCraftedComponent,
        20,
        5,
        penetratingWarheadCraftedComponent,
        destination
      );
    }
    // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratingMissileFactoryID) {
      PenetratingWarheadCraftedComponent penetratingWarheadCraftedComponent = PenetratingWarheadCraftedComponent(
        getAddressById(components, PenetratingWarheadCraftedComponentID)
      );
      KineticMissileCraftedComponent kineticMissileCraftedComponent = KineticMissileCraftedComponent(
        getAddressById(components, KineticMissileCraftedComponentID)
      );
      PenetratingMissileCraftedComponent penetratingMissileCraftedComponent = PenetratingMissileCraftedComponent(
        getAddressById(components, PenetratingMissileCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        penetratingWarheadCraftedComponent,
        kineticMissileCraftedComponent,
        1,
        1,
        penetratingMissileCraftedComponent,
        destination
      );
    }
    // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighTempFoundryID) {
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithOneItem(tungstenResourceComponent, 10, tungstenRodsCraftedComponent, destination);
    }
    // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PrecisionMachineryFactoryID) {
      IridiumResourceComponent iridiumResourceComponent = IridiumResourceComponent(
        getAddressById(components, IridiumResourceComponentID)
      );
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithOneItem(iridiumResourceComponent, 10, iridiumCrystalCraftedComponent, destination);
    }
    // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == IridiumDrillbitFactoryID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
        getAddressById(components, IridiumDrillbitCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        iridiumCrystalCraftedComponent,
        tungstenRodsCraftedComponent,
        5,
        10,
        iridiumDrillbitCraftedComponent,
        destination
      );
    }
    // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighEnergyLaserFactoryID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        iridiumCrystalCraftedComponent,
        advancedPowerSourceCraftedComponent,
        10,
        5,
        laserPowerSourceCraftedComponent,
        destination
      );
    }
    // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricWarheadFactoryID) {
      IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
        getAddressById(components, IridiumDrillbitCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      ThermobaricWarheadCraftedComponent thermobaricWarheadCraftedComponent = ThermobaricWarheadCraftedComponent(
        getAddressById(components, ThermobaricWarheadCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        iridiumDrillbitCraftedComponent,
        laserPowerSourceCraftedComponent,
        1,
        1,
        thermobaricWarheadCraftedComponent,
        destination
      );
    }
    // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricMissileFactoryID) {
      PenetratingMissileCraftedComponent penetratingMissileCraftedComponent = PenetratingMissileCraftedComponent(
        getAddressById(components, PenetratingMissileCraftedComponentID)
      );
      ThermobaricWarheadCraftedComponent thermobaricWarheadCraftedComponent = ThermobaricWarheadCraftedComponent(
        getAddressById(components, ThermobaricWarheadCraftedComponentID)
      );
      ThermobaricMissileCraftedComponent thermobaricMissileCraftedComponent = ThermobaricMissileCraftedComponent(
        getAddressById(components, ThermobaricMissileCraftedComponentID)
      );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithTwoItems(
        penetratingMissileCraftedComponent,
        thermobaricWarheadCraftedComponent,
        10,
        1,
        thermobaricMissileCraftedComponent,
        destination
      );
    }
    // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KimberliteCatalystFactoryID) {
      KimberliteResourceComponent kimberliteResourceComponent = KimberliteResourceComponent(
        getAddressById(components, KimberliteResourceComponentID)
      );
      KimberliteCrystalCatalystCraftedComponent kimberliteCrystalCatalystCraftedComponent = KimberliteCrystalCatalystCraftedComponent(
          getAddressById(components, KimberliteCrystalCatalystCraftedComponentID)
        );
      uint256 destination = entitiesAtPosition[0];

      LibCraft.craftWithOneItem(
        kimberliteResourceComponent,
        10,
        kimberliteCrystalCatalystCraftedComponent,
        destination
      );
    } else {
      revert("Invalid factory");
    }

    // TODO: gracefully exit

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
