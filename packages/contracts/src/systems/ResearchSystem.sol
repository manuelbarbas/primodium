// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

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

// import all crafted components
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

// import all resource research components
import { CopperResearchComponent, ID as CopperResearchComponentID } from "components/CopperResearchComponent.sol";
import { LithiumResearchComponent, ID as LithiumResearchComponentID } from "components/LithiumResearchComponent.sol";
import { TitaniumResearchComponent, ID as TitaniumResearchComponentID } from "components/TitaniumResearchComponent.sol";
import { OsmiumResearchComponent, ID as OsmiumResearchComponentID } from "components/OsmiumResearchComponent.sol";
import { TungstenResearchComponent, ID as TungstenResearchComponentID } from "components/TungstenResearchComponent.sol";
import { IridiumResearchComponent, ID as IridiumResearchComponentID } from "components/IridiumResearchComponent.sol";
import { KimberliteResearchComponent, ID as KimberliteResearchComponentID } from "components/KimberliteResearchComponent.sol";

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

// debug
import { FastMinerResearchComponent, ID as FastMinerResearchComponentID } from "components/FastMinerResearchComponent.sol";

import { LibResearch } from "libraries/LibResearch.sol";

uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 researchItem = abi.decode(arguments, (uint256));

    // Research FastMiner with 100 IronResource and 100 CopperResource
    if (researchItem == FastMinerResearchComponentID) {
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      FastMinerResearchComponent fastMinerResearchComponent = FastMinerResearchComponent(
        getAddressById(components, FastMinerResearchComponentID)
      );
      return
        LibResearch.researchFastMiner(
          ironResourceComponent,
          copperResourceComponent,
          fastMinerResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Copper with 200 IronResource
    else if (researchItem == CopperResearchComponentID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      CopperResearchComponent copperResearchComponent = CopperResearchComponent(
        getAddressById(components, CopperResearchComponentID)
      );
      return LibResearch.researchCopper(ironResourceComponent, copperResearchComponent, addressToEntity(msg.sender));
    }
    // Research PlatingFactory with 200 IronResource and 200 CopperResource
    else if (researchItem == PlatingFactoryResearchComponentID) {
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      PlatingFactoryResearchComponent platingFactoryResearchComponent = PlatingFactoryResearchComponent(
        getAddressById(components, PlatingFactoryResearchComponentID)
      );
      return
        LibResearch.researchPlatingFactory(
          ironResourceComponent,
          copperResourceComponent,
          platingFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Lithium with 20 IronPlateCrafted and 100 CopperResource
    else if (researchItem == LithiumResearchComponentID) {
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      LithiumResearchComponent lithiumResearchComponent = LithiumResearchComponent(
        getAddressById(components, LithiumResearchComponentID)
      );
      return
        LibResearch.researchLithium(
          ironPlateCraftedComponent,
          copperResourceComponent,
          lithiumResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research BasicBatteryFactory with 50 IronPlateCrafted and 100 LithiumResource
    else if (researchItem == BasicBatteryFactoryResearchComponentID) {
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      LithiumResourceComponent lithiumResourceComponent = LithiumResourceComponent(
        getAddressById(components, LithiumResourceComponentID)
      );
      BasicBatteryFactoryResearchComponent basicBatteryFactoryResearchComponent = BasicBatteryFactoryResearchComponent(
        getAddressById(components, BasicBatteryFactoryResearchComponentID)
      );
      return
        LibResearch.researchBasicBatteryFactory(
          ironPlateCraftedComponent,
          lithiumResourceComponent,
          basicBatteryFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research KineticMissileFactory with 50 BasicPowerSourceCrafted and 100 IronResource
    else if (researchItem == KineticMissileFactoryResearchComponentID) {
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );
      KineticMissileFactoryResearchComponent kineticMissileFactoryResearchComponent = KineticMissileFactoryResearchComponent(
          getAddressById(components, KineticMissileFactoryResearchComponentID)
        );
      return
        LibResearch.researchKineticMissileFactory(
          basicPowerSourceCraftedComponent,
          ironResourceComponent,
          kineticMissileFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Titanium with 50 BasicPowerSourceCrafted
    else if (researchItem == TitaniumResearchComponentID) {
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      TitaniumResearchComponent titaniumResearchComponent = TitaniumResearchComponent(
        getAddressById(components, TitaniumResearchComponentID)
      );
      return
        LibResearch.researchTitanium(
          basicPowerSourceCraftedComponent,
          titaniumResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research ProjectileLauncher with 50 BasicPowerSourceCrafted and 500 TitaniumResource
    else if (researchItem == ProjectileLauncherResearchComponentID) {
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      ProjectileLauncherResearchComponent projectileLauncherResearchComponent = ProjectileLauncherResearchComponent(
        getAddressById(components, ProjectileLauncherResearchComponentID)
      );
      return
        LibResearch.researchProjectileLauncher(
          basicPowerSourceCraftedComponent,
          titaniumResourceComponent,
          projectileLauncherResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research HardenedDrill with 200 TitaniumResource, 500 IronPlateCrafted, and 50 BasicPowerSourceCrafted
    else if (researchItem == HardenedDrillResearchComponentID) {
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      HardenedDrillResearchComponent hardenedDrillResearchComponent = HardenedDrillResearchComponent(
        getAddressById(components, HardenedDrillResearchComponentID)
      );
      return
        LibResearch.researchHardenedDrill(
          titaniumResourceComponent,
          ironPlateCraftedComponent,
          basicPowerSourceCraftedComponent,
          hardenedDrillResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Osmium with 300 TitaniumResource
    else if (researchItem == OsmiumResearchComponentID) {
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      OsmiumResearchComponent osmiumResearchComponent = OsmiumResearchComponent(
        getAddressById(components, OsmiumResearchComponentID)
      );
      return
        LibResearch.researchOsmium(titaniumResourceComponent, osmiumResearchComponent, addressToEntity(msg.sender));
    }
    // Research DenseMetalRefinery with 100 OsmiumResource, 300 TitaniumResource, and 100 BasicPowerSourceCrafted
    else if (researchItem == DenseMetalRefineryResearchComponentID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
        getAddressById(components, BasicPowerSourceCraftedComponentID)
      );
      DenseMetalRefineryResearchComponent denseMetalRefineryResearchComponent = DenseMetalRefineryResearchComponent(
        getAddressById(components, DenseMetalRefineryResearchComponentID)
      );
      return
        LibResearch.researchDenseMetalRefinery(
          osmiumResourceComponent,
          titaniumResourceComponent,
          basicPowerSourceCraftedComponent,
          denseMetalRefineryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research AdvancedBatteryFactory with 200 OsmiumResource, 100 IronPlateCrafted, and 400 TitaniumResource
    else if (researchItem == AdvancedBatteryFactoryResearchComponentID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
        getAddressById(components, IronPlateCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      AdvancedBatteryFactoryResearchComponent advancedBatteryFactoryResearchComponent = AdvancedBatteryFactoryResearchComponent(
          getAddressById(components, AdvancedBatteryFactoryResearchComponentID)
        );
      return
        LibResearch.researchAdvancedBatteryFactory(
          osmiumResourceComponent,
          ironPlateCraftedComponent,
          titaniumResourceComponent,
          advancedBatteryFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
    else if (researchItem == TungstenResearchComponentID) {
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      TitaniumResourceComponent titaniumResourceComponent = TitaniumResourceComponent(
        getAddressById(components, TitaniumResourceComponentID)
      );
      TungstenResearchComponent tungstenResearchComponent = TungstenResearchComponent(
        getAddressById(components, TungstenResearchComponentID)
      );
      return
        LibResearch.researchTungsten(
          refinedOsmiumCraftedComponent,
          titaniumResourceComponent,
          tungstenResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research HighTempFoundry with 200 TungstenResource, 100 OsmiumResource, 50 AdvancedPowerSourceCrafted
    else if (researchItem == HighTempFoundryResearchComponentID) {
      TungstenResourceComponent tungstenResourceComponent = TungstenResourceComponent(
        getAddressById(components, TungstenResourceComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      HighTempFoundryResearchComponent highTempFoundryResearchComponent = HighTempFoundryResearchComponent(
        getAddressById(components, HighTempFoundryResearchComponentID)
      );
      return
        LibResearch.researchHighTempFoundry(
          tungstenResourceComponent,
          osmiumResourceComponent,
          advancedPowerSourceCraftedComponent,
          highTempFoundryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research Iridium with 100 TungstenRodCrafted 100 OsmiumResource
    else if (researchItem == IridiumResearchComponentID) {
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      IridiumResearchComponent iridiumResearchComponent = IridiumResearchComponent(
        getAddressById(components, IridiumResearchComponentID)
      );
      return
        LibResearch.researchIridium(
          tungstenRodsCraftedComponent,
          osmiumResourceComponent,
          iridiumResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research PrecisionMachineryFactory with 200 IridiumResource and 100 TungstenRodsCrafted
    else if (researchItem == PrecisionMachineryFactoryResearchComponentID) {
      IridiumResourceComponent iridiumResourceComponent = IridiumResourceComponent(
        getAddressById(components, IridiumResourceComponentID)
      );
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      PrecisionMachineryFactoryResearchComponent precisionMachineryFactoryResearchComponent = PrecisionMachineryFactoryResearchComponent(
          getAddressById(components, PrecisionMachineryFactoryResearchComponentID)
        );
      return
        LibResearch.researchPrecisionMachineryFactory(
          iridiumResourceComponent,
          tungstenRodsCraftedComponent,
          precisionMachineryFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research IridiumDrillbitFactory with 100 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (researchItem == IridiumDrillbitFactoryResearchComponentID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
        getAddressById(components, LaserPowerSourceCraftedComponentID)
      );
      IridiumDrillbitFactoryResearchComponent iridiumDrillbitFactoryResearchComponent = IridiumDrillbitFactoryResearchComponent(
          getAddressById(components, IridiumDrillbitFactoryResearchComponentID)
        );
      return
        LibResearch.researchIridiumDrillbitFactory(
          iridiumCrystalCraftedComponent,
          laserPowerSourceCraftedComponent,
          iridiumDrillbitFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research PrecisionPneumaticDrill with 200 TungstenRodsCrafted and 50 IridiumDrillbitCrafted
    else if (researchItem == PrecisionPneumaticDrillResearchComponentID) {
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
        getAddressById(components, IridiumDrillbitCraftedComponentID)
      );
      PrecisionPneumaticDrillResearchComponent precisionPneumaticDrillResearchComponent = PrecisionPneumaticDrillResearchComponent(
          getAddressById(components, PrecisionPneumaticDrillResearchComponentID)
        );
      return
        LibResearch.researchPrecisionPneumaticDrill(
          tungstenRodsCraftedComponent,
          iridiumDrillbitCraftedComponent,
          precisionPneumaticDrillResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research PenetratorFactory with 500 OsmiumResource and 50 AdvancedPowerSourceCrafted
    else if (researchItem == PenetratorFactoryResearchComponentID) {
      OsmiumResourceComponent osmiumResourceComponent = OsmiumResourceComponent(
        getAddressById(components, OsmiumResourceComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      PenetratorFactoryResearchComponent penetratorFactoryResearchComponent = PenetratorFactoryResearchComponent(
        getAddressById(components, PenetratorFactoryResearchComponentID)
      );
      return
        LibResearch.researchPenetratorFactory(
          osmiumResourceComponent,
          advancedPowerSourceCraftedComponent,
          penetratorFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research PenetratingMissileFactory with 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    else if (researchItem == PenetratingMissileFactoryResearchComponentID) {
      RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
        getAddressById(components, RefinedOsmiumCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      PenetratingMissileFactoryResearchComponent penetratingMissileFactoryResearchComponent = PenetratingMissileFactoryResearchComponent(
          getAddressById(components, PenetratingMissileFactoryResearchComponentID)
        );
      return
        LibResearch.researchPenetratingMissileFactory(
          refinedOsmiumCraftedComponent,
          advancedPowerSourceCraftedComponent,
          penetratingMissileFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research MissileLaunchComplex with 50 TungstenRodsCrafted and 100 AdvancedPowerSourceCrafted
    else if (researchItem == MissileLaunchComplexResearchComponentID) {
      TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
        getAddressById(components, TungstenRodsCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      MissileLaunchComplexResearchComponent missileLaunchComplexResearchComponent = MissileLaunchComplexResearchComponent(
          getAddressById(components, MissileLaunchComplexResearchComponentID)
        );
      return
        LibResearch.researchMissileLaunchComplex(
          tungstenRodsCraftedComponent,
          advancedPowerSourceCraftedComponent,
          missileLaunchComplexResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research High-energyLaserFactory with 200 IridiumCrystalCrafted 150 AdvancedPowerSourceCrafted
    else if (researchItem == HighEnergyLaserFactoryResearchComponentID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
        getAddressById(components, AdvancedPowerSourceCraftedComponentID)
      );
      HighEnergyLaserFactoryResearchComponent highEnergyLaserFactoryResearchComponent = HighEnergyLaserFactoryResearchComponent(
          getAddressById(components, HighEnergyLaserFactoryResearchComponentID)
        );
      return
        LibResearch.researchHighEnergyLaserFactory(
          iridiumCrystalCraftedComponent,
          advancedPowerSourceCraftedComponent,
          highEnergyLaserFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Research ThermobaricWarheadFactory with 200 IridiumCrystalCrafted
    else if (researchItem == ThermobaricWarheadFactoryResearchComponentID) {
      IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
        getAddressById(components, IridiumCrystalCraftedComponentID)
      );
      ThermobaricWarheadFactoryResearchComponent thermobaricWarheadFactoryResearchComponent = ThermobaricWarheadFactoryResearchComponent(
          getAddressById(components, ThermobaricWarheadFactoryResearchComponentID)
        );
      return
        LibResearch.researchThermobaricWarheadFactory(
          iridiumCrystalCraftedComponent,
          thermobaricWarheadFactoryResearchComponent,
          addressToEntity(msg.sender)
        );
    }
    // Resesarch ThermobaricMissileFactory with 200 IridiumCrystalCrafted and 100 TungstenRodsCrafted
    // Research Kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
    // Research KimberliteCatalystFactory with 300 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else {
      return abi.encode(false);
    }
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
