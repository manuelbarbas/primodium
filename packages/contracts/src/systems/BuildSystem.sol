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

// check if building is unlocked
// import all factory research components:
import { PlatingFactoryResearchComponent, ID as PlatingFactoryResearchComponentID } from "components/PlatingFactoryResearchComponent.sol";
import { BasicBatteryFactoryResearchComponent, ID as BasicBatteryFactoryResearchComponentID } from "components/BasicBatteryFactoryResearchComponent.sol";
import { KineticMissileFactoryResearchComponent, ID as KineticMissileFactoryResearchComponentID } from "components/KineticMissileFactoryResearchComponent.sol";
import { ProjectileLauncherResearchComponent, ID as ProjectileLauncherResearchComponentID } from "components/ProjectileLauncherResearchComponent.sol";
import { HardenedDrillResearchComponent, ID as HardenedDrillResearchComponentID } from "components/HardenedDrillResearchComponent.sol";
import { DenseMetalRefineryResearchComponent, ID as DenseMetalRefineryResearchComponentID } from "components/DenseMetalRefineryResearchComponent.sol";
import { AdvancedBatteryFactoryResearchComponent, ID as AdvancedBatteryFactoryResearchComponentID } from "components/AdvancedBatteryFactoryResearchComponent.sol";
import { HighTempFoundryResearchComponent, ID as HighTempFoundryResearchComponentID } from "components/HighTempFoundryResearchComponent.sol";
import { PrecisionMachineryFactoryResearchComponent, ID as PrecisionMachineryFactoryResearchComponentID } from "components/PrecisionMachineryFactoryResearchComponent.sol";
import { IridiumDrillbitFactoryResearchComponent, ID as IridiumDrillbitFactoryResearchComponentID } from "components/IridiumDrillbitFactoryResearchComponent.sol";
import { PrecisionPneumaticDrillResearchComponent, ID as PrecisionPneumaticDrillResearchComponentID } from "components/PrecisionPneumaticDrillResearchComponent.sol";
import { PenetratorFactoryResearchComponent, ID as PenetratorFactoryResearchComponentID } from "components/PenetratorFactoryResearchComponent.sol";
import { PenetratingMissileFactoryResearchComponent, ID as PenetratingMissileFactoryResearchComponentID } from "components/PenetratingMissileFactoryResearchComponent.sol";
import { MissileLaunchComplexResearchComponent, ID as MissileLaunchComplexResearchComponentID } from "components/MissileLaunchComplexResearchComponent.sol";
import { HighEnergyLaserFactoryResearchComponent, ID as HighEnergyLaserFactoryResearchComponentID } from "components/HighEnergyLaserFactoryResearchComponent.sol";
import { ThermobaricWarheadFactoryResearchComponent, ID as ThermobaricWarheadFactoryResearchComponentID } from "components/ThermobaricWarheadFactoryResearchComponent.sol";
import { ThermobaricMissileFactoryResearchComponent, ID as ThermobaricMissileFactoryResearchComponentID } from "components/ThermobaricMissileFactoryResearchComponent.sol";
import { KimberliteCatalystFactoryResearchComponent, ID as KimberliteCatalystFactoryResearchComponentID } from "components/KimberliteCatalystFactoryResearchComponent.sol";

// debug buildings
import { MainBaseID, ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibBuild } from "../libraries/LibBuild.sol";
import { LibResearch } from "../libraries/LibResearch.sol";

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
    require(entitiesAtPosition.length == 0, "[BuildSystem] Cannot build on a non-empty coordinate");

    // Check if the player has enough resources to build
    // debug buildings are free:  ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (
      blockType == ConveyerID ||
      blockType == MinerID ||
      blockType == LithiumMinerID ||
      blockType == BulletFactoryID ||
      blockType == SiloID
    ) {
      // debug buildings, do nothing
    } else if (blockType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );

      if (LibResearch.hasResearched(mainBaseInitializedComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(addressToEntity(msg.sender));
      }
      // give starter pack of 200 iron to each new player that builds a main base
      // IronResourceComponent ironResourceComponent = IronResourceComponent(
      //   getAddressById(components, IronResourceComponentID)
      // );
      // LibMath.incrementBy(ironResourceComponent, addressToEntity(msg.sender), 200);
    }
    // Build BasicMiner with 100 IronResource
    else if (blockType == BasicMinerID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      LibBuild.buildWithOneItem(ironResourceComponent, 100, addressToEntity(msg.sender));
    }
    // Build Node with 50 IronResource
    else if (blockType == NodeID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      LibBuild.buildWithOneItem(ironResourceComponent, 50, addressToEntity(msg.sender));
    }
    // Check if building has been unlocked in research for all the following.
    // Build PlatingFactory with 100 IronResource and 50 CopperResource
    else if (blockType == PlatingFactoryID) {
      PlatingFactoryResearchComponent platingFactoryResearchComponent = PlatingFactoryResearchComponent(
        getAddressById(components, PlatingFactoryResearchComponentID)
      );
      if (!LibResearch.hasResearched(platingFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PlatingFactory");
      }
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      LibBuild.buildWithTwoItems(ironResourceComponent, copperResourceComponent, 100, 50, addressToEntity(msg.sender));
    }
    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    else if (blockType == BasicBatteryFactoryID) {
      BasicBatteryFactoryResearchComponent basicBatteryFactoryResearchComponent = BasicBatteryFactoryResearchComponent(
        getAddressById(components, BasicBatteryFactoryResearchComponentID)
      );
      if (!LibResearch.hasResearched(basicBatteryFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched BasicBatteryFactory");
      }
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      LibBuild.buildWithTwoItems(
        ironPlateCraftedComponent,
        copperResourceComponent,
        20,
        50,
        addressToEntity(msg.sender)
      );
    }
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
    else if (blockType == KineticMissileFactoryID) {
      KineticMissileFactoryResearchComponent kineticMissileFactoryResearchComponent = KineticMissileFactoryResearchComponent(
          getAddressById(components, KineticMissileFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(kineticMissileFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched KineticMissileFactory");
      }
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      LithiumResourceComponent lithiumResourceComponent = LithiumResourceComponent(
        getAddressById(components, LithiumResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        ironPlateCraftedComponent,
        lithiumResourceComponent,
        basicPowerSourceCraftedComponent,
        100,
        50,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    else if (blockType == ProjectileLauncherID) {
      ProjectileLauncherResearchComponent projectileLauncherResearchComponent = ProjectileLauncherResearchComponent(
        getAddressById(components, ProjectileLauncherResearchComponentID)
      );
      if (!LibResearch.hasResearched(projectileLauncherResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched ProjectileLauncher");
      }
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      LibBuild.buildWithTwoItems(
        ironPlateCraftedComponent,
        titaniumResourceComponent,
        100,
        100,
        addressToEntity(msg.sender)
      );
    }
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    else if (blockType == HardenedDrillID) {
      HardenedDrillResearchComponent hardenedDrillResearchComponent = HardenedDrillResearchComponent(
        getAddressById(components, HardenedDrillResearchComponentID)
      );
      if (!LibResearch.hasResearched(hardenedDrillResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched HardenDrill");
      }
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        titaniumResourceComponent,
        ironPlateCraftedComponent,
        basicPowerSourceCraftedComponent,
        100,
        10,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    else if (blockType == DenseMetalRefineryID) {
      DenseMetalRefineryResearchComponent denseMetalRefineryResearchComponent = DenseMetalRefineryResearchComponent(
        getAddressById(components, DenseMetalRefineryResearchComponentID)
      );
      if (!LibResearch.hasResearched(denseMetalRefineryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched DenseMetalRefinery");
      }
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
      LibBuild.buildWithFourItems(
        osmiumResourceComponent,
        titaniumResourceComponent,
        ironPlateCraftedComponent,
        basicPowerSourceCraftedComponent,
        50,
        100,
        30,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    else if (blockType == AdvancedBatteryFactoryID) {
      AdvancedBatteryFactoryResearchComponent advancedBatteryFactoryResearchComponent = AdvancedBatteryFactoryResearchComponent(
          getAddressById(components, AdvancedBatteryFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(advancedBatteryFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched AdvancedBatteryFactory");
      }
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        osmiumResourceComponent,
        titaniumResourceComponent,
        basicPowerSourceCraftedComponent,
        150,
        50,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    else if (blockType == HighTempFoundryID) {
      HighTempFoundryResearchComponent highTempFoundryResearchComponent = HighTempFoundryResearchComponent(
        getAddressById(components, HighTempFoundryResearchComponentID)
      );
      if (!LibResearch.hasResearched(highTempFoundryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched HighTempFoundry");
      }
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        tungstenResourceComponent,
        refinedOsmiumCraftedComponent,
        advancedPowerSourceCraftedComponent,
        50,
        50,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PrecisionMachineryFactoryID) {
      PrecisionMachineryFactoryResearchComponent precisionMachineryFactoryResearchComponent = PrecisionMachineryFactoryResearchComponent(
          getAddressById(components, PrecisionMachineryFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(precisionMachineryFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PrecisionMachineryFactory");
      }
      IridiumResourceComponent iridiumResourceComponent = IridiumResourceComponent(
        getAddressById(components, IridiumResourceComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        iridiumResourceComponent,
        tungstenRodsCraftedComponent,
        advancedPowerSourceCraftedComponent,
        50,
        50,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
    else if (blockType == IridiumDrillbitFactoryID) {
      IridiumDrillbitFactoryResearchComponent iridiumDrillbitFactoryResearchComponent = IridiumDrillbitFactoryResearchComponent(
          getAddressById(components, IridiumDrillbitFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(iridiumDrillbitFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched IridiumDrillbitFactory");
      }
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithTwoItems(
        tungstenRodsCraftedComponent,
        laserPowerSourceCraftedComponent,
        50,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
    else if (blockType == PrecisionPneumaticDrillID) {
      PrecisionPneumaticDrillResearchComponent precisionPneumaticDrillResearchComponent = PrecisionPneumaticDrillResearchComponent(
          getAddressById(components, PrecisionPneumaticDrillResearchComponentID)
        );
      if (!LibResearch.hasResearched(precisionPneumaticDrillResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PrecisionPneumaticDrill");
      }
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        tungstenResourceComponent,
        osmiumResourceComponent,
        laserPowerSourceCraftedComponent,
        100,
        100,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PenetratorFactoryID) {
      PenetratorFactoryResearchComponent penetratorFactoryResearchComponent = PenetratorFactoryResearchComponent(
        getAddressById(components, PenetratorFactoryResearchComponentID)
      );
      if (!LibResearch.hasResearched(penetratorFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PenetratorFactory");
      }
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        osmiumResourceComponent,
        ironPlateCraftedComponent,
        advancedPowerSourceCraftedComponent,
        200,
        50,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    else if (blockType == PenetratingMissileFactoryID) {
      PenetratingMissileFactoryResearchComponent penetratingMissileFactoryResearchComponent = PenetratingMissileFactoryResearchComponent(
          getAddressById(components, PenetratingMissileFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(penetratingMissileFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PenetratingMissileFactory");
      }
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        osmiumResourceComponent,
        titaniumResourceComponent,
        advancedPowerSourceCraftedComponent,
        300,
        100,
        15,
        addressToEntity(msg.sender)
      );
    }
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    else if (blockType == MissileLaunchComplexID) {
      MissileLaunchComplexResearchComponent missileLaunchComplexResearchComponent = MissileLaunchComplexResearchComponent(
          getAddressById(components, MissileLaunchComplexResearchComponentID)
        );
      if (!LibResearch.hasResearched(missileLaunchComplexResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched MissileLaunchComplex");
      }
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      LibBuild.buildWithTwoItems(
        tungstenRodsCraftedComponent,
        osmiumResourceComponent,
        100,
        100,
        addressToEntity(msg.sender)
      );
    }
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    else if (blockType == HighEnergyLaserFactoryID) {
      HighEnergyLaserFactoryResearchComponent highEnergyLaserFactoryResearchComponent = HighEnergyLaserFactoryResearchComponent(
          getAddressById(components, HighEnergyLaserFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(highEnergyLaserFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched HighEnergyLaserFactory");
      }
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        iridiumCrystalCraftedComponent,
        refinedOsmiumCraftedComponent,
        advancedPowerSourceCraftedComponent,
        50,
        100,
        50,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    else if (blockType == ThermobaricWarheadFactoryID) {
      ThermobaricWarheadFactoryResearchComponent thermobaricWarheadFactoryResearchComponent = ThermobaricWarheadFactoryResearchComponent(
          getAddressById(components, ThermobaricWarheadFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(thermobaricWarheadFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched ThermobaricWarheadFactory");
      }
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        refinedOsmiumCraftedComponent,
        iridiumCrystalCraftedComponent,
        laserPowerSourceCraftedComponent,
        200,
        100,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == ThermobaricMissileFactoryID) {
      ThermobaricMissileFactoryResearchComponent thermobaricMissileFactoryResearchComponent = ThermobaricMissileFactoryResearchComponent(
          getAddressById(components, ThermobaricMissileFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(thermobaricMissileFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched ThermobaricMissileFactory");
      }
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithThreeItems(
        iridiumCrystalCraftedComponent,
        tungstenRodsCraftedComponent,
        laserPowerSourceCraftedComponent,
        100,
        100,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == KimberliteCatalystFactoryID) {
      KimberliteCatalystFactoryResearchComponent kimberliteCatalystFactoryResearchComponent = KimberliteCatalystFactoryResearchComponent(
          getAddressById(components, KimberliteCatalystFactoryResearchComponentID)
        );
      if (!LibResearch.hasResearched(kimberliteCatalystFactoryResearchComponent, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched KimberliteCatalystFactory");
      }
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      LibBuild.buildWithTwoItems(
        iridiumCrystalCraftedComponent,
        laserPowerSourceCraftedComponent,
        200,
        20,
        addressToEntity(msg.sender)
      );
    } else {
      revert("[BuildSystem] Invalid block type");
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
