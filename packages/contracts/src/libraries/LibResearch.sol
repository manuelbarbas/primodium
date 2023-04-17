// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

library LibResearch {
  // ###########################################################################
  // # DEBUG

  // research fast miner with 100 IronResource and 100 CopperResource
  function researchFastMiner(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    BoolComponent fastMinerResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_REQUIRED = 100;
    uint256 COPPER_REQUIRED = 100;

    if (fastMinerResearchComponent.has(entity) && fastMinerResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curCopper < COPPER_REQUIRED || curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      fastMinerResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // ###########################################################################
  // # Resources

  // research copper with 200 IronResource
  function researchCopper(
    Uint256Component ironResourceComponent,
    BoolComponent copperResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_REQUIRED = 200;

    if (copperResearchComponent.has(entity) && copperResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      copperResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research lithium with 20 IronPlateCrafted and 100 CopperResource
  function researchLithium(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component copperResourceComponent,
    BoolComponent lithiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_PLATE_REQUIRED = 20;
    uint256 COPPER_REQUIRED = 100;

    if (lithiumResearchComponent.has(entity) && lithiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED || curCopper < COPPER_REQUIRED) {
      return abi.encode(false);
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);

      lithiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research titanium with 50 BasicPowerSourceCrafted
  function researchTitanium(
    Uint256Component basicPowerSourceCraftedComponent,
    BoolComponent titaniumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 BASIC_POWER_SOURCE_REQUIRED = 50;

    if (titaniumResearchComponent.has(entity) && titaniumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);

      titaniumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research osmium with 300 TitaniumResource
  function researchOsmium(
    Uint256Component titaniumResourceComponent,
    BoolComponent osmiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TITANIUM_REQUIRED = 300;

    if (osmiumResearchComponent.has(entity) && osmiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      osmiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
  function researchTungsten(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component titaniumResourceComponent,
    BoolComponent tungstenResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 REFINED_OSMIUM_REQUIRED = 100;
    uint256 TITANIUM_REQUIRED = 200;

    if (tungstenResearchComponent.has(entity) && tungstenResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED || curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      tungstenResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research iridium with 100 TungstenRodCrafted 100 OsmiumResource
  function researchIridium(
    Uint256Component tungstenRodCraftedComponent,
    Uint256Component osmiumResourceComponent,
    BoolComponent iridiumResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TUNGSTEN_ROD_REQUIRED = 100;
    uint256 OSMIUM_REQUIRED = 100;

    if (iridiumResearchComponent.has(entity) && iridiumResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTungstenRod = tungstenRodCraftedComponent.has(entity) ? tungstenRodCraftedComponent.getValue(entity) : 0;
    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;

    if (curTungstenRod < TUNGSTEN_ROD_REQUIRED || curOsmium < OSMIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      tungstenRodCraftedComponent.set(entity, curTungstenRod - TUNGSTEN_ROD_REQUIRED);
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);

      iridiumResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // research kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
  function researchKimberlite(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component tungstenResourceComponent,
    BoolComponent kimberliteResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 100;
    uint256 TUNGSTEN_REQUIRED = 100;

    if (kimberliteResearchComponent.has(entity) && kimberliteResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curTungsten = tungstenResourceComponent.has(entity) ? tungstenResourceComponent.getValue(entity) : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curTungsten < TUNGSTEN_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      tungstenResourceComponent.set(entity, curTungsten - TUNGSTEN_REQUIRED);

      kimberliteResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // ###########################################################################
  // # Buildings and Factory Buildings

  // Research PlatingFactory with 200 IronResource and 200 CopperResource
  function researchPlatingFactory(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    BoolComponent platingFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_REQUIRED = 200;
    uint256 COPPER_REQUIRED = 200;

    if (platingFactoryResearchComponent.has(entity) && platingFactoryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED || curCopper < COPPER_REQUIRED) {
      return abi.encode(false);
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);

      platingFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research BasicBatteryFactory with 50 IronPlateCrafted and 100 LithiumResource
  function researchBasicBatteryFactory(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component lithiumResourceComponent,
    BoolComponent basicBatteryFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRON_PLATE_REQUIRED = 50;
    uint256 LITHIUM_REQUIRED = 100;

    if (basicBatteryFactoryResearchComponent.has(entity) && basicBatteryFactoryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curLithium = lithiumResourceComponent.has(entity) ? lithiumResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED || curLithium < LITHIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      lithiumResourceComponent.set(entity, curLithium - LITHIUM_REQUIRED);

      basicBatteryFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research KineticMissileFactory with 50 BasicPowerSourceCrafted and 100 IronResource
  function researchKineticMissileFactory(
    Uint256Component basicPowerSourceCraftedComponent,
    Uint256Component ironResourceComponent,
    BoolComponent kineticMissileFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 BASIC_POWER_SOURCE_REQUIRED = 50;
    uint256 IRON_REQUIRED = 100;

    if (kineticMissileFactoryResearchComponent.has(entity) && kineticMissileFactoryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED || curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      kineticMissileFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research ProjectileLauncher with 50 BasicPowerSourceCrafted and 500 TitaniumResource
  function researchProjectileLauncher(
    Uint256Component basicPowerSourceCraftedComponent,
    Uint256Component titaniumResourceComponent,
    BoolComponent projectileLauncherResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 BASIC_POWER_SOURCE_REQUIRED = 50;
    uint256 TITANIUM_REQUIRED = 500;

    if (projectileLauncherResearchComponent.has(entity) && projectileLauncherResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED || curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      projectileLauncherResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research HardenedDrill with 200 TitaniumResource, 500 IronPlateCrafted, 50 BasicPowerSourceCrafted
  function researchHardenedDrill(
    Uint256Component titaniumResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    BoolComponent hardenedDrillResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TITANIUM_REQUIRED = 200;
    uint256 IRON_PLATE_REQUIRED = 500;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 50;

    if (hardenedDrillResearchComponent.has(entity) && hardenedDrillResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (
      curTitanium < TITANIUM_REQUIRED ||
      curIronPlate < IRON_PLATE_REQUIRED ||
      curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED
    ) {
      return abi.encode(false);
    } else {
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);

      hardenedDrillResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research DenseMetalRefinery with 100 OsmiumResource, 300 TitaniumResource, 100 BasicPowerSourceCrafted
  function researchDenseMetalRefinery(
    Uint256Component osmiumResourceComponent,
    Uint256Component titaniumResourceComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    BoolComponent denseMetalRefineryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 OSMIUM_REQUIRED = 100;
    uint256 TITANIUM_REQUIRED = 300;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 100;

    if (denseMetalRefineryResearchComponent.has(entity) && denseMetalRefineryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (
      curOsmium < OSMIUM_REQUIRED ||
      curTitanium < TITANIUM_REQUIRED ||
      curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED
    ) {
      return abi.encode(false);
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);

      denseMetalRefineryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research AdvancedBatteryFactory with 200 OsmiumResource, 100 IronPlateCrafted, 400 TitaniumResource
  function researchAdvancedBatteryFactory(
    Uint256Component osmiumResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    Uint256Component titaniumResourceComponent,
    BoolComponent advancedBatteryFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 OSMIUM_REQUIRED = 200;
    uint256 IRON_PLATE_REQUIRED = 100;
    uint256 TITANIUM_REQUIRED = 400;

    if (
      advancedBatteryFactoryResearchComponent.has(entity) && advancedBatteryFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curOsmium < OSMIUM_REQUIRED || curIronPlate < IRON_PLATE_REQUIRED || curTitanium < TITANIUM_REQUIRED) {
      return abi.encode(false);
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);

      advancedBatteryFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research HighTempFoundry with 200 TungstenResource, 100 OsmiumResource, 50 AdvancedPowerSourceCrafted
  function researchHighTempFoundry(
    Uint256Component tungstenResourceComponent,
    Uint256Component osmiumResourceComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    BoolComponent highTempFoundryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TUNGSTEN_REQUIRED = 200;
    uint256 OSMIUM_REQUIRED = 100;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 50;

    if (highTempFoundryResearchComponent.has(entity) && highTempFoundryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTungsten = tungstenResourceComponent.has(entity) ? tungstenResourceComponent.getValue(entity) : 0;
    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (
      curTungsten < TUNGSTEN_REQUIRED ||
      curOsmium < OSMIUM_REQUIRED ||
      curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED
    ) {
      return abi.encode(false);
    } else {
      tungstenResourceComponent.set(entity, curTungsten - TUNGSTEN_REQUIRED);
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);

      highTempFoundryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research PrecisionMachineryFactory with 200 IridiumResource and 100 TungstenRodsCrafted
  function researchPrecisionMachineryFactory(
    Uint256Component iridiumResourceComponent,
    Uint256Component tungstenRodsCraftedComponent,
    BoolComponent precisionMachineryFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_REQUIRED = 200;
    uint256 TUNGSTEN_RODS_REQUIRED = 100;

    if (
      precisionMachineryFactoryResearchComponent.has(entity) &&
      precisionMachineryFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridium = iridiumResourceComponent.has(entity) ? iridiumResourceComponent.getValue(entity) : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;

    if (curIridium < IRIDIUM_REQUIRED || curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumResourceComponent.set(entity, curIridium - IRIDIUM_REQUIRED);
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);

      precisionMachineryFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research IridiumDrillbitFactory with 100 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
  function researchIridiumDrillbitFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    BoolComponent iridiumDrillbitFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 100;
    uint256 LASER_POWER_SOURCE_REQUIRED = 20;

    if (
      iridiumDrillbitFactoryResearchComponent.has(entity) && iridiumDrillbitFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);

      iridiumDrillbitFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research PrecisionPneumaticDrill with 200 TungstenRodsCrafted and 50 IridiumDrillbitCrafted
  function researchPrecisionPneumaticDrill(
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component iridiumDrillbitCraftedComponent,
    BoolComponent precisionPneumaticDrillResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TUNGSTEN_RODS_REQUIRED = 200;
    uint256 IRIDIUM_DRILLBIT_REQUIRED = 50;

    if (
      precisionPneumaticDrillResearchComponent.has(entity) && precisionPneumaticDrillResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curIridiumDrillbit = iridiumDrillbitCraftedComponent.has(entity)
      ? iridiumDrillbitCraftedComponent.getValue(entity)
      : 0;

    if (curTungstenRods < TUNGSTEN_RODS_REQUIRED || curIridiumDrillbit < IRIDIUM_DRILLBIT_REQUIRED) {
      return abi.encode(false);
    } else {
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      iridiumDrillbitCraftedComponent.set(entity, curIridiumDrillbit - IRIDIUM_DRILLBIT_REQUIRED);

      precisionPneumaticDrillResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research PenetratorFactory with 500 OsmiumResource and 50 AdvancedPowerSourceCrafted
  function researchPenetratorFactory(
    Uint256Component osmiumResourceComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    BoolComponent penetratorFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 OSMIUM_REQUIRED = 500;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 50;

    if (penetratorFactoryResearchComponent.has(entity) && penetratorFactoryResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curOsmium < OSMIUM_REQUIRED || curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);

      penetratorFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research PenetratingMissileFactory with 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
  function researchPenetratingMissileFactory(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    BoolComponent penetratingMissileFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 REFINED_OSMIUM_REQUIRED = 100;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 50;

    if (
      penetratingMissileFactoryResearchComponent.has(entity) &&
      penetratingMissileFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED || curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);

      penetratingMissileFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research MissileLaunchComplex with 50 TungstenRodsCrafted and 100 AdvancedPowerSourceCrafted
  function researchMissileLaunchComplex(
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    BoolComponent missileLaunchComplexResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 TUNGSTEN_RODS_REQUIRED = 50;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 100;

    if (missileLaunchComplexResearchComponent.has(entity) && missileLaunchComplexResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curTungstenRods < TUNGSTEN_RODS_REQUIRED || curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);

      missileLaunchComplexResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research High-energyLaserFactory with 200 IridiumCrystalCrafted 150 AdvancedPowerSourceCrafted
  function researchHighEnergyLaserFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    BoolComponent highEnergyLaserFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 200;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 150;

    if (
      highEnergyLaserFactoryResearchComponent.has(entity) && highEnergyLaserFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);

      highEnergyLaserFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research ThermobaricWarheadFactory with 200 IridiumCrystalCrafted
  function researchThermobaricWarheadFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    BoolComponent thermobaricWarheadFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 200;

    if (
      thermobaricWarheadFactoryResearchComponent.has(entity) &&
      thermobaricWarheadFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);

      thermobaricWarheadFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Resesarch ThermobaricMissileFactory with 200 IridiumCrystalCrafted and 100 TungstenRodsCrafted
  function researchThermobaricMissileFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component tungstenRodsCraftedComponent,
    BoolComponent thermobaricMissileFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 200;
    uint256 TUNGSTEN_RODS_REQUIRED = 100;

    if (
      thermobaricMissileFactoryResearchComponent.has(entity) &&
      thermobaricMissileFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);

      thermobaricMissileFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }

  // Research KimberliteCatalystFactory with 300 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
  function researchKimberliteCatalystFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    BoolComponent kimberliteCatalystFactoryResearchComponent,
    uint256 entity
  ) internal returns (bytes memory) {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 300;
    uint256 LASER_POWER_SOURCE_REQUIRED = 20;

    if (
      kimberliteCatalystFactoryResearchComponent.has(entity) &&
      kimberliteCatalystFactoryResearchComponent.getValue(entity)
    ) {
      return abi.encode(false);
    }

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED || curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      return abi.encode(false);
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);

      kimberliteCatalystFactoryResearchComponent.set(entity);
      return abi.encode(true);
    }
  }
}
