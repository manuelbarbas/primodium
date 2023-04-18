// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibCraft {
  // ###########################################################################
  // # DEBUG

  // Craft 1 Bullet with 1 IronResource and 1 CopperResource
  function craftBullet(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    Uint256Component bulletCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRON_REQUIRED = 1;
    uint256 COPPER_REQUIRED = 1;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curBullets = bulletCraftedComponent.has(entity) ? bulletCraftedComponent.getValue(entity) : 0;

    uint256 maxBulletsFromIron = curIron / IRON_REQUIRED;
    uint256 maxBulletsFromCopper = curCopper / COPPER_REQUIRED;

    uint256 bullets = maxBulletsFromIron <= maxBulletsFromCopper ? maxBulletsFromIron : maxBulletsFromCopper;
    uint256 consumeIronBy = bullets * IRON_REQUIRED;
    uint256 consumeCopperBy = bullets * COPPER_REQUIRED;

    ironResourceComponent.set(entity, curIron - consumeIronBy);
    copperResourceComponent.set(entity, curCopper - consumeCopperBy);
    bulletCraftedComponent.set(entity, curBullets + bullets);
  }

  // ###########################################################################
  // Production

  // Craft 1 IronPlate with 10 IronResource
  function craftIronPlate(
    Uint256Component ironResourceComponent,
    Uint256Component ironPlateCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRON_REQUIRED = 10;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curIronPlates = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;

    uint256 maxIronPlates = curIron / IRON_REQUIRED;
    uint256 consumeIronBy = maxIronPlates * IRON_REQUIRED;

    ironResourceComponent.set(entity, curIron - consumeIronBy);
    ironPlateCraftedComponent.set(entity, curIronPlates + maxIronPlates);
  }

  // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource
  function craftBasicPowerSource(
    Uint256Component lithiumResourceComponent,
    Uint256Component ironResourceComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 LITHIUM_REQUIRED = 100;
    uint256 IRON_REQUIRED = 20;

    uint256 curLithium = lithiumResourceComponent.has(entity) ? lithiumResourceComponent.getValue(entity) : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;
    uint256 curBasicPowerSources = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;

    uint256 maxBasicPowerSourcesFromLithium = curLithium / LITHIUM_REQUIRED;
    uint256 maxBasicPowerSourcesFromIron = curIron / IRON_REQUIRED;

    uint256 basicPowerSources = maxBasicPowerSourcesFromLithium <= maxBasicPowerSourcesFromIron
      ? maxBasicPowerSourcesFromLithium
      : maxBasicPowerSourcesFromIron;
    uint256 consumeLithiumBy = basicPowerSources * LITHIUM_REQUIRED;
    uint256 consumeIronBy = basicPowerSources * IRON_REQUIRED;

    lithiumResourceComponent.set(entity, curLithium - consumeLithiumBy);
    ironResourceComponent.set(entity, curIron - consumeIronBy);
    basicPowerSourceCraftedComponent.set(entity, curBasicPowerSources + basicPowerSources);
  }

  // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource
  function craftKineticMissile(
    Uint256Component basicPowerSourceCraftedComponent,
    Uint256Component titaniumResource,
    Uint256Component kineticMissileCraftedComponent,
    uint256 entity
  ) internal {
    uint256 BASIC_POWER_SOURCE_REQUIRED = 10;
    uint256 TITANIUM_REQUIRED = 20;

    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curTitanium = titaniumResource.has(entity) ? titaniumResource.getValue(entity) : 0;
    uint256 curKineticMissiles = kineticMissileCraftedComponent.has(entity)
      ? kineticMissileCraftedComponent.getValue(entity)
      : 0;

    uint256 maxKineticMissilesFromBasicPowerSource = curBasicPowerSource / BASIC_POWER_SOURCE_REQUIRED;
    uint256 maxKineticMissilesFromTitanium = curTitanium / TITANIUM_REQUIRED;

    uint256 kineticMissiles = maxKineticMissilesFromBasicPowerSource <= maxKineticMissilesFromTitanium
      ? maxKineticMissilesFromBasicPowerSource
      : maxKineticMissilesFromTitanium;
    uint256 consumeBasicPowerSourceBy = kineticMissiles * BASIC_POWER_SOURCE_REQUIRED;
    uint256 consumeTitaniumBy = kineticMissiles * TITANIUM_REQUIRED;

    basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - consumeBasicPowerSourceBy);
    titaniumResource.set(entity, curTitanium - consumeTitaniumBy);
    kineticMissileCraftedComponent.set(entity, curKineticMissiles + kineticMissiles);
  }

  // Craft 1 RefinedOsmium with 10 OsmiumResource
  function craftRefinedOsmium(
    Uint256Component osmiumResourceComponent,
    Uint256Component refinedOsmiumCraftedComponent,
    uint256 entity
  ) internal {
    uint256 OSMIUM_REQUIRED = 10;

    uint256 curOsmium = osmiumResourceComponent.has(entity) ? osmiumResourceComponent.getValue(entity) : 0;
    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;

    uint256 maxRefinedOsmium = curOsmium / OSMIUM_REQUIRED;
    uint256 consumeOsmiumBy = maxRefinedOsmium * OSMIUM_REQUIRED;

    osmiumResourceComponent.set(entity, curOsmium - consumeOsmiumBy);
    refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium + maxRefinedOsmium);
  }

  // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted
  function craftAdvancedPowerSource(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component basicPowerSourceCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 REFINED_OSMIUM_REQUIRED = 10;
    uint256 BASIC_POWER_SOURCE_REQUIRED = 2;

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curBasicPowerSource = basicPowerSourceCraftedComponent.has(entity)
      ? basicPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;

    uint256 maxAdvancedPowerSourceFromRefinedOsmium = curRefinedOsmium / REFINED_OSMIUM_REQUIRED;
    uint256 maxAdvancedPowerSourceFromBasicPowerSource = curBasicPowerSource / BASIC_POWER_SOURCE_REQUIRED;

    uint256 advancedPowerSource = maxAdvancedPowerSourceFromRefinedOsmium <= maxAdvancedPowerSourceFromBasicPowerSource
      ? maxAdvancedPowerSourceFromRefinedOsmium
      : maxAdvancedPowerSourceFromBasicPowerSource;
    uint256 consumeRefinedOsmiumBy = advancedPowerSource * REFINED_OSMIUM_REQUIRED;
    uint256 consumeBasicPowerSourceBy = advancedPowerSource * BASIC_POWER_SOURCE_REQUIRED;

    refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - consumeRefinedOsmiumBy);
    basicPowerSourceCraftedComponent.set(entity, curBasicPowerSource - consumeBasicPowerSourceBy);
    advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource + advancedPowerSource);
  }

  // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted
  function craftPenetratingWarhead(
    Uint256Component refinedOsmiumCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    Uint256Component penetratingWarheadCraftedComponent,
    uint256 entity
  ) internal {
    uint256 REFINED_OSMIUM_REQUIRED = 20;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 5;

    uint256 curRefinedOsmium = refinedOsmiumCraftedComponent.has(entity)
      ? refinedOsmiumCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curPenetratingWarheads = penetratingWarheadCraftedComponent.has(entity)
      ? penetratingWarheadCraftedComponent.getValue(entity)
      : 0;

    uint256 maxPenetratingWarheadsFromRefinedOsmium = curRefinedOsmium / REFINED_OSMIUM_REQUIRED;
    uint256 maxPenetratingWarheadsFromAdvancedPowerSource = curAdvancedPowerSource / ADVANCED_POWER_SOURCE_REQUIRED;

    uint256 penetratingWarheads = maxPenetratingWarheadsFromRefinedOsmium <=
      maxPenetratingWarheadsFromAdvancedPowerSource
      ? maxPenetratingWarheadsFromRefinedOsmium
      : maxPenetratingWarheadsFromAdvancedPowerSource;
    uint256 consumeRefinedOsmiumBy = penetratingWarheads * REFINED_OSMIUM_REQUIRED;
    uint256 consumeAdvancedPowerSourceBy = penetratingWarheads * ADVANCED_POWER_SOURCE_REQUIRED;

    refinedOsmiumCraftedComponent.set(entity, curRefinedOsmium - consumeRefinedOsmiumBy);
    advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - consumeAdvancedPowerSourceBy);
    penetratingWarheadCraftedComponent.set(entity, curPenetratingWarheads + penetratingWarheads);
  }

  // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted
  function craftPenetratingMissile(
    Uint256Component penetratingWarheadCraftedComponent,
    Uint256Component kineticMissileCraftedComponent,
    Uint256Component penetratingMissileCraftedComponent,
    uint256 entity
  ) internal {
    uint256 PENETRATING_WARHEAD_REQUIRED = 1;
    uint256 KINETIC_MISSILE_REQUIRED = 1;

    uint256 curPenetratingWarhead = penetratingWarheadCraftedComponent.has(entity)
      ? penetratingWarheadCraftedComponent.getValue(entity)
      : 0;
    uint256 curKineticMissile = kineticMissileCraftedComponent.has(entity)
      ? kineticMissileCraftedComponent.getValue(entity)
      : 0;
    uint256 curPenetratingMissile = penetratingMissileCraftedComponent.has(entity)
      ? penetratingMissileCraftedComponent.getValue(entity)
      : 0;

    uint256 maxPenetratingMissileFromPenetratingWarhead = curPenetratingWarhead / PENETRATING_WARHEAD_REQUIRED;
    uint256 maxPenetratingMissileFromKineticMissile = curKineticMissile / KINETIC_MISSILE_REQUIRED;

    uint256 penetratingMissile = maxPenetratingMissileFromPenetratingWarhead <= maxPenetratingMissileFromKineticMissile
      ? maxPenetratingMissileFromPenetratingWarhead
      : maxPenetratingMissileFromKineticMissile;
    uint256 consumePenetratingWarheadBy = penetratingMissile * PENETRATING_WARHEAD_REQUIRED;
    uint256 consumeKineticMissileBy = penetratingMissile * KINETIC_MISSILE_REQUIRED;

    penetratingWarheadCraftedComponent.set(entity, curPenetratingWarhead - consumePenetratingWarheadBy);
    kineticMissileCraftedComponent.set(entity, curKineticMissile - consumeKineticMissileBy);
    penetratingMissileCraftedComponent.set(entity, curPenetratingMissile + penetratingMissile);
  }

  // Craft 1 TungstenRods with 10 TungstenResource
  function craftTungstenRods(
    Uint256Component tungstenResourceComponent,
    Uint256Component tungstenRodsCraftedComponent,
    uint256 entity
  ) internal {
    uint256 TUNGSTEN_RESOURCE_REQUIRED = 10;

    uint256 curTungstenResource = tungstenResourceComponent.has(entity)
      ? tungstenResourceComponent.getValue(entity)
      : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;

    uint256 tungstenRods = curTungstenResource / TUNGSTEN_RESOURCE_REQUIRED;
    uint256 consumeTungstenResourceBy = tungstenRods * TUNGSTEN_RESOURCE_REQUIRED;

    tungstenResourceComponent.set(entity, curTungstenResource - consumeTungstenResourceBy);
    tungstenRodsCraftedComponent.set(entity, curTungstenRods + tungstenRods);
  }

  // Craft 1 IridiumCrystal with 10 IridiumResource
  function craftIridiumCrystal(
    Uint256Component iridiumResourceComponent,
    Uint256Component iridiumCrystalCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_RESOURCE_REQUIRED = 10;

    uint256 curIridiumResource = iridiumResourceComponent.has(entity) ? iridiumResourceComponent.getValue(entity) : 0;
    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;

    uint256 iridiumCrystal = curIridiumResource / IRIDIUM_RESOURCE_REQUIRED;
    uint256 consumeIridiumResourceBy = iridiumCrystal * IRIDIUM_RESOURCE_REQUIRED;

    iridiumResourceComponent.set(entity, curIridiumResource - consumeIridiumResourceBy);
    iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal + iridiumCrystal);
  }

  // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted
  function craftIridiumDrillbit(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component tungstenRodsCraftedComponent,
    Uint256Component iridiumDrillbitCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 5;
    uint256 TUNGSTEN_RODS_REQUIRED = 10;

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curTungstenRods = tungstenRodsCraftedComponent.has(entity)
      ? tungstenRodsCraftedComponent.getValue(entity)
      : 0;
    uint256 curIridiumDrillbit = iridiumDrillbitCraftedComponent.has(entity)
      ? iridiumDrillbitCraftedComponent.getValue(entity)
      : 0;

    uint256 maxIridiumDrillbitFromIridiumCrystal = curIridiumCrystal / IRIDIUM_CRYSTAL_REQUIRED;
    uint256 maxIridiumDrillbitFromTungstenRods = curTungstenRods / TUNGSTEN_RODS_REQUIRED;

    uint256 iridiumDrillbit = maxIridiumDrillbitFromIridiumCrystal <= maxIridiumDrillbitFromTungstenRods
      ? maxIridiumDrillbitFromIridiumCrystal
      : maxIridiumDrillbitFromTungstenRods;
    uint256 consumeIridiumCrystalBy = iridiumDrillbit * IRIDIUM_CRYSTAL_REQUIRED;
    uint256 consumeTungstenRodsBy = iridiumDrillbit * TUNGSTEN_RODS_REQUIRED;

    iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - consumeIridiumCrystalBy);
    tungstenRodsCraftedComponent.set(entity, curTungstenRods - consumeTungstenRodsBy);
    iridiumDrillbitCraftedComponent.set(entity, curIridiumDrillbit + iridiumDrillbit);
  }

  // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource
  function craftLaserPowerSource(
    Uint256Component iridiumCrystalCraftedComponent,
    Uint256Component advancedPowerSourceCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_CRYSTAL_REQUIRED = 10;
    uint256 ADVANCED_POWER_SOURCE_REQUIRED = 5;

    uint256 curIridiumCrystal = iridiumCrystalCraftedComponent.has(entity)
      ? iridiumCrystalCraftedComponent.getValue(entity)
      : 0;
    uint256 curAdvancedPowerSource = advancedPowerSourceCraftedComponent.has(entity)
      ? advancedPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;

    uint256 maxLaserPowerSourceFromIridiumCrystal = curIridiumCrystal / IRIDIUM_CRYSTAL_REQUIRED;
    uint256 maxLaserPowerSourceFromAdvancedPowerSource = curAdvancedPowerSource / ADVANCED_POWER_SOURCE_REQUIRED;

    uint256 laserPowerSource = maxLaserPowerSourceFromIridiumCrystal <= maxLaserPowerSourceFromAdvancedPowerSource
      ? maxLaserPowerSourceFromIridiumCrystal
      : maxLaserPowerSourceFromAdvancedPowerSource;
    uint256 consumeIridiumCrystalBy = laserPowerSource * IRIDIUM_CRYSTAL_REQUIRED;
    uint256 consumeAdvancedPowerSourceBy = laserPowerSource * ADVANCED_POWER_SOURCE_REQUIRED;

    iridiumCrystalCraftedComponent.set(entity, curIridiumCrystal - consumeIridiumCrystalBy);
    advancedPowerSourceCraftedComponent.set(entity, curAdvancedPowerSource - consumeAdvancedPowerSourceBy);
    laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource + laserPowerSource);
  }

  // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted
  function craftThermobaricWarhead(
    Uint256Component iridiumDrillbitCraftedComponent,
    Uint256Component laserPowerSourceCraftedComponent,
    Uint256Component thermobaricWarheadCraftedComponent,
    uint256 entity
  ) internal {
    uint256 IRIDIUM_DRILLBIT_REQUIRED = 1;
    uint256 LASER_POWER_SOURCE_REQUIRED = 1;

    uint256 curIridiumDrillbit = iridiumDrillbitCraftedComponent.has(entity)
      ? iridiumDrillbitCraftedComponent.getValue(entity)
      : 0;
    uint256 curLaserPowerSource = laserPowerSourceCraftedComponent.has(entity)
      ? laserPowerSourceCraftedComponent.getValue(entity)
      : 0;
    uint256 curThermobaricWarhead = thermobaricWarheadCraftedComponent.has(entity)
      ? thermobaricWarheadCraftedComponent.getValue(entity)
      : 0;

    uint256 maxThermobaricWarheadFromIridiumDrillbit = curIridiumDrillbit / IRIDIUM_DRILLBIT_REQUIRED;
    uint256 maxThermobaricWarheadFromLaserPowerSource = curLaserPowerSource / LASER_POWER_SOURCE_REQUIRED;

    uint256 thermobaricWarhead = maxThermobaricWarheadFromIridiumDrillbit <= maxThermobaricWarheadFromLaserPowerSource
      ? maxThermobaricWarheadFromIridiumDrillbit
      : maxThermobaricWarheadFromLaserPowerSource;
    uint256 consumeIridiumDrillbitBy = thermobaricWarhead * IRIDIUM_DRILLBIT_REQUIRED;
    uint256 consumeLaserPowerSourceBy = thermobaricWarhead * LASER_POWER_SOURCE_REQUIRED;

    iridiumDrillbitCraftedComponent.set(entity, curIridiumDrillbit - consumeIridiumDrillbitBy);
    laserPowerSourceCraftedComponent.set(entity, curLaserPowerSource - consumeLaserPowerSourceBy);
    thermobaricWarheadCraftedComponent.set(entity, curThermobaricWarhead + thermobaricWarhead);
  }

  // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted
  function craftThermobaricMissile(
    Uint256Component penetratingMissileCraftedComponent,
    Uint256Component thermobaricWarheadCraftedComponent,
    Uint256Component thermobaricMissileCraftedComponent,
    uint256 entity
  ) internal {
    uint256 PENETRATING_MISSILE_REQUIRED = 10;
    uint256 THERMOBARIC_WARHEAD_REQUIRED = 1;

    uint256 curPenetratingMissile = penetratingMissileCraftedComponent.has(entity)
      ? penetratingMissileCraftedComponent.getValue(entity)
      : 0;
    uint256 curThermobaricWarhead = thermobaricWarheadCraftedComponent.has(entity)
      ? thermobaricWarheadCraftedComponent.getValue(entity)
      : 0;
    uint256 curThermobaricMissile = thermobaricMissileCraftedComponent.has(entity)
      ? thermobaricMissileCraftedComponent.getValue(entity)
      : 0;

    uint256 maxThermobaricMissileFromPenetratingMissile = curPenetratingMissile / PENETRATING_MISSILE_REQUIRED;
    uint256 maxThermobaricMissileFromThermobaricWarhead = curThermobaricWarhead / THERMOBARIC_WARHEAD_REQUIRED;

    uint256 thermobaricMissile = maxThermobaricMissileFromPenetratingMissile <=
      maxThermobaricMissileFromThermobaricWarhead
      ? maxThermobaricMissileFromPenetratingMissile
      : maxThermobaricMissileFromThermobaricWarhead;
    uint256 consumePenetratingMissileBy = thermobaricMissile * PENETRATING_MISSILE_REQUIRED;
    uint256 consumeThermobaricWarheadBy = thermobaricMissile * THERMOBARIC_WARHEAD_REQUIRED;

    penetratingMissileCraftedComponent.set(entity, curPenetratingMissile - consumePenetratingMissileBy);
    thermobaricWarheadCraftedComponent.set(entity, curThermobaricWarhead - consumeThermobaricWarheadBy);
    thermobaricMissileCraftedComponent.set(entity, curThermobaricMissile + thermobaricMissile);
  }

  // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource
  function craftKimberliteCrystalCatalyst(
    Uint256Component kimberliteResourceComponent,
    Uint256Component kimberliteCrystalCatalystCraftedComponent,
    uint256 entity
  ) internal {
    uint256 KIMBERLITE_RESOURCE_REQUIRED = 10;

    uint256 curKimberliteResource = kimberliteResourceComponent.has(entity)
      ? kimberliteResourceComponent.getValue(entity)
      : 0;
    uint256 curKimberliteCrystalCatalyst = kimberliteCrystalCatalystCraftedComponent.has(entity)
      ? kimberliteCrystalCatalystCraftedComponent.getValue(entity)
      : 0;

    uint256 kimberliteCrystalCatalyst = curKimberliteResource / KIMBERLITE_RESOURCE_REQUIRED;
    uint256 consumeKimberliteResourceBy = kimberliteCrystalCatalyst * KIMBERLITE_RESOURCE_REQUIRED;

    kimberliteResourceComponent.set(entity, curKimberliteResource - consumeKimberliteResourceBy);
    kimberliteCrystalCatalystCraftedComponent.set(entity, curKimberliteCrystalCatalyst + kimberliteCrystalCatalyst);
  }
}
