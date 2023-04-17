// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibBuild {
  // Build BasicMiner with 100 IronResource
  function buildBasicMiner(Uint256Component ironResourceComponent, uint256 entity) internal {
    uint256 IRON_REQUIRED = 100;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
    }
  }

  // Build Node with 50 IronResource
  function buildNode(Uint256Component ironResourceComponent, uint256 entity) internal {
    uint256 IRON_REQUIRED = 50;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
    }
  }

  // Build PlatingFactory with 100 IronResource and 50 CopperResource
  function buildPlatingFactory(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    uint256 entity
  ) internal {
    uint256 IRON_REQUIRED = 100;
    uint256 COPPER_REQUIRED = 50;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else if (curCopper < COPPER_REQUIRED) {
      revert("not enough copper");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
    }
  }

  // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
  function buildBasicBatteryFactory(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component copperResourceComponent,
    uint256 entity
  ) internal {
    uint256 IRON_PLATE_REQUIRED = 20;
    uint256 COPPER_REQUIRED = 50;

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curCopper < COPPER_REQUIRED) {
      revert("not enough copper");
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
    }
  }

  // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
  function buildKineticMissileFactory(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component lithiumResourceComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRON_PLATE_REQUIRED = 100;
    uint256 LITHIUM_REQUIRED = 50;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 10;

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curLithium = lithiumResourceComponent.has(entity) ? lithiumResourceComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curLithium < LITHIUM_REQUIRED) {
      revert("not enough lithium");
    } else if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      revert("not enough basic power source");
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      lithiumResourceComponent.set(entity, curLithium - LITHIUM_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
    }
  }

  // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
  function buildProjectileLauncher(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component titaniumResourceComponent,
    uint256 entity
  ) internal {
    uint256 IRON_PLATE_REQUIRED = 100;
    uint256 TITANIUM_REQUIRED = 100;

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curTitanium < TITANIUM_REQUIRED) {
      revert("not enough titanium");
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
    }
  }

  // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
  function buildHardenedDrill(
    Uint256Component titaniumResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 TITANIUM_REQUIRED = 100;
    uint256 IRON_PLATE_REQUIRED = 10;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 5;

    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curTitanium < TITANIUM_REQUIRED) {
      revert("not enough titanium");
    } else if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      revert("not enough basic power source");
    } else {
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
    }
  }

  // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
  function buildDenseMetalRefinery(
    Uint256Component osmiumResourceComponent,
    Uint256Component titaniumResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 OSMIUM_REQUIRED = 50;
    uint256 TITANIUM_REQUIRED = 100;
    uint256 IRON_PLATE_REQUIRED = 30;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 10;

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else if (curTitanium < TITANIUM_REQUIRED) {
      revert("not enough titanium");
    } else if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      revert("not enough basic power source");
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
    }
  }

  // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSource
  function buildAdvancedBatteryFactory(
    Uint256Component osmiumResourceComponent,
    Uint256Component titaniumResourceComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 OSMIUM_REQUIRED = 150;
    uint256 TITANIUM_REQUIRED = 50;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 20;

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else if (curTitanium < TITANIUM_REQUIRED) {
      revert("not enough titanium");
    } else if (curBasicPowerSource < BASIC_POWER_SOURCE_REQUIRED) {
      revert("not enough basic power source");
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - BASIC_POWER_SOURCE_REQUIRED);
    }
  }

  // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
  function buildHighTempFoundry(
    Uint256Component tungstenResourceComponent,
    Uint256Component refinedOsmiumComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 TUNGSTEN_REQUIRED = 50;
    uint256 REFINED_OSMIUM_REQUIRED = 50;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 20;

    uint256 curTungsten = tungstenResourceComponent.has(entity) ? tungstenResourceComponent.getValue(entity) : 0;
    uint256 curRefinedOsmium = refinedOsmiumComponent.has(entity) ? refinedOsmiumComponent.getValue(entity) : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curTungsten < TUNGSTEN_REQUIRED) {
      revert("not enough tungsten");
    } else if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED) {
      revert("not enough refined osmium");
    } else if (curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      revert("not enough advanced power source");
    } else {
      tungstenResourceComponent.set(entity, curTungsten - TUNGSTEN_REQUIRED);
      refinedOsmiumComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);
    }
  }

  // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
  function buildPrecisionMachineryFactory(
    Uint256Component iridiumResourceComponent,
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_REQUIRED = 50;
    uint256 TUNGSTEN_RODS_REQUIRED = 50;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 10;

    uint256 curIridium = iridiumResourceComponent.has(entity) ? iridiumResourceComponent.getValue(entity) : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridium < IRIDIUM_REQUIRED) {
      revert("not enough iridium");
    } else if (curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      revert("not enough tungsten rods");
    } else if (curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      revert("not enough advanced power source");
    } else {
      iridiumResourceComponent.set(entity, curIridium - IRIDIUM_REQUIRED);
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);
    }
  }

  // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
  function buildIridiumDrillbitFactory(
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 TUNGSTEN_RODS_REQUIRED = 50;
    uint256 LASER_POWER_SOURCE_REQUIRED = 5;

    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      revert("not enough tungsten rods");
    } else if (curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      revert("not enough laser power source");
    } else {
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);
    }
  }

  // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
  function buildPrecisionPneumaticDrill(
    Uint256Component tungstenResourceComponent,
    Uint256Component osmiumResourceComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 TUNGSTEN_REQUIRED = 100;
    uint256 OSMIUM_REQUIRED = 100;
    uint256 LASER_POWER_SOURCE_REQUIRED = 5;

    uint256 curTungsten = tungstenResourceComponent.has(entity) ? tungstenResourceComponent.getValue(entity) : 0;
    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curTungsten < TUNGSTEN_REQUIRED) {
      revert("not enough tungsten");
    } else if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else if (curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      revert("not enough laser power source");
    } else {
      tungstenResourceComponent.set(entity, curTungsten - TUNGSTEN_REQUIRED);
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);
    }
  }

  // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
  function buildPenetratorFactory(
    Uint256Component osmiumResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 OSMIUM_REQUIRED = 200;
    uint256 IRON_PLATE_REQUIRED = 50;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 10;

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      revert("not enough advanced power source");
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);
    }
  }

  // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
  function buildPenetratingMissileFactory(
    Uint256Component osmiumResourceComponent,
    Uint256Component titaniumResourceComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 OSMIUM_REQUIRED = 300;
    uint256 TITANIUM_REQUIRED = 100;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 15;

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curTitanium = titaniumResourceComponent.has(entity) ? titaniumResourceComponent.getValue(entity) : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else if (curTitanium < TITANIUM_REQUIRED) {
      revert("not enough titanium");
    } else if (curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      revert("not enough advanced power source");
    } else {
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
      titaniumResourceComponent.set(entity, curTitanium - TITANIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);
    }
  }

  // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
  function buildMissileLaunchComplex(
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component osmiumResourceComponent,
    uint256 entity
  ) internal {
    uint256 TUNGSTEN_RODS_REQUIRED = 100;
    uint256 OSMIUM_REQUIRED = 100;

    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;

    if (curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      revert("not enough tungsten rods");
    } else if (curOsmium < OSMIUM_REQUIRED) {
      revert("not enough osmium");
    } else {
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      osmiumResourceComponent.set(entity, curOsmium - OSMIUM_REQUIRED);
    }
  }

  // Build High-energyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
  function buildHighEnergyLaserFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 50;
    uint256 REFINED_OSMIUM_REQUIRED = 100;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 50;

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED) {
      revert("not enough iridium crystal");
    } else if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED) {
      revert("not enough refined osmium");
    } else if (curAdvancedPowerSource < ADVANCED_POWER_SOURCE_REQUIRED) {
      revert("not enough advanced power source");
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - ADVANCED_POWER_SOURCE_REQUIRED);
    }
  }

  // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
  function buildThermobaricWarheadFactory(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 REFINED_OSMIUM_REQUIRED = 200;
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 100;
    uint256 LASER_POWER_SOURCE_REQUIRED = 10;

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curRefinedOsmium < REFINED_OSMIUM_REQUIRED) {
      revert("not enough refined osmium");
    } else if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED) {
      revert("not enough iridium crystal");
    } else if (curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      revert("not enough laser power source");
    } else {
      refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - REFINED_OSMIUM_REQUIRED);
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);
    }
  }

  // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
  function buildThermobaricMissileFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 100;
    uint256 TUNGSTEN_RODS_REQUIRED = 100;
    uint256 LASER_POWER_SOURCE_REQUIRED = 20;

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED) {
      revert("not enough iridium crystal");
    } else if (curTungstenRods < TUNGSTEN_RODS_REQUIRED) {
      revert("not enough tungsten rods");
    } else if (curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      revert("not enough laser power source");
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      tungstenRodsCraftedComponent.set(entity, curTungstenRods - TUNGSTEN_RODS_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);
    }
  }

  // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
  function buildKimberliteCatalystFactory(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 200;
    uint256 LASER_POWER_SOURCE_REQUIRED = 20;

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    if (curIridiumCrystal < IRIDIUM_CRYSTAL_REQUIRED) {
      revert("not enough iridium crystal");
    } else if (curLaserPowerSource < LASER_POWER_SOURCE_REQUIRED) {
      revert("not enough laser power source");
    } else {
      iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - IRIDIUM_CRYSTAL_REQUIRED);
      laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - LASER_POWER_SOURCE_REQUIRED);
    }
  }
}
