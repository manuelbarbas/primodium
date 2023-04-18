// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// import all resources
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

// debug buildings
import { MainBaseID, ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibBuild } from "../libraries/LibBuild.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(arguments, (uint256, Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );

    // Check there isn't another tile there
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 0, "can not build at non-empty coord");

    // Check if the player has enough resources to build
    // debug buildings are free: MainBaseID, ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    if (
      blockType == MainBaseID ||
      blockType == ConveyerID ||
      blockType == MinerID ||
      blockType == LithiumMinerID ||
      blockType == BulletFactoryID ||
      blockType == SiloID
    ) {
      // debug buildings, do nothing
    }
    // Build BasicMiner with 100 IronResource
    else if (blockType == BasicMinerID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      LibBuild.buildBasicMiner(ironResourceComponent, addressToEntity(msg.sender));
    }
    // Build Node with 50 IronResource
    else if (blockType == NodeID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      LibBuild.buildNode(ironResourceComponent, addressToEntity(msg.sender));
    }
    // Build PlatingFactory with 100 IronResource and 50 CopperResource
    else if (blockType == PlatingFactoryID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      LibBuild.buildPlatingFactory(ironResourceComponent, copperResourceComponent, addressToEntity(msg.sender));
    }
    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    else if (blockType == BasicBatteryFactoryID) {
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      LibBuild.buildBasicBatteryFactory(
        ironPlateCraftedComponent,
        copperResourceComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
    else if (blockType == KineticMissileFactoryID) {
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      LithiumResourceComponent lithiumResourceComponent = LithiumResourceComponent(
        getAddressById(components, LithiumResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildKineticMissileFactory(
        ironPlateCraftedComponent,
        lithiumResourceComponent,
        basicPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    else if (blockType == ProjectileLauncherID) {
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      LibBuild.buildProjectileLauncher(
        ironPlateCraftedComponent,
        titaniumResourceComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    else if (blockType == HardenedDrillID) {
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildHardenedDrill(
        titaniumResourceComponent,
        ironPlateCraftedComponent,
        basicPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    else if (blockType == DenseMetalRefineryID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildDenseMetalRefinery(
        osmiumResourceComponent,
        titaniumResourceComponent,
        ironPlateCraftedComponent,
        basicPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    else if (blockType == AdvancedBatteryFactoryID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildAdvancedBatteryFactory(
        osmiumResourceComponent,
        titaniumResourceComponent,
        basicPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    else if (blockType == HighTempFoundryID) {
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildHighTempFoundry(
        tungstenResourceComponent,
        refinedOsmiumCraftedComponent,
        advancedPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PrecisionMachineryFactoryID) {
      IridiumResourceComponent iridiumResourceComponent = IridiumResourceComponent(
        getAddressById(components, IridiumResourceComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildPrecisionMachineryFactory(
        iridiumResourceComponent,
        tungstenRodsCraftedComponent,
        advancedPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
    else if (blockType == IridiumDrillbitFactoryID) {
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildIridiumDrillbitFactory(
        tungstenRodsCraftedComponent,
        laserPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
    else if (blockType == PrecisionPneumaticDrillID) {
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildPrecisionPneumaticDrill(
        tungstenResourceComponent,
        osmiumResourceComponent,
        laserPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PenetratorFactoryID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildPenetratorFactory(
        osmiumResourceComponent,
        ironPlateCraftedComponent,
        advancedPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    else if (blockType == PenetratingMissileFactoryID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildPenetratingMissileFactory(
        osmiumResourceComponent,
        titaniumResourceComponent,
        advancedPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    else if (blockType == MissileLaunchComplexID) {
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      LibBuild.buildMissileLaunchComplex(
        tungstenRodsCraftedComponent,
        osmiumResourceComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    else if (blockType == HighEnergyLaserFactoryID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildHighEnergyLaserFactory(
        iridiumCrystalCraftedComponent,
        refinedOsmiumCraftedComponent,
        advancedPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    else if (blockType == ThermobaricWarheadFactoryID) {
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildThermobaricWarheadFactory(
        refinedOsmiumCraftedComponent,
        iridiumCrystalCraftedComponent,
        laserPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == ThermobaricMissileFactoryID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildThermobaricMissileFactory(
        iridiumCrystalCraftedComponent,
        tungstenRodsCraftedComponent,
        laserPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    }
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == KimberliteCatalystFactoryID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildKimberliteCatalystFactory(
        iridiumCrystalCraftedComponent,
        laserPowerSourceCraftedComponent,
        addressToEntity(msg.sender)
      );
    } else {
      revert("unknown block type");
    }

    // Randomly generate IDs instead of basing on coordinate
    uint256 blockEntity = world.getUniqueEntityId();
    positionComponent.set(blockEntity, coord);
    tileComponent.set(blockEntity, blockType);
    ownedByComponent.set(blockEntity, addressToEntity(msg.sender));
    lastBuiltAtComponent.set(blockEntity, block.number);
    lastClaimedAtComponent.set(blockEntity, block.number);

    return abi.encode(blockEntity);
  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(blockType, coord));
  }
}
