// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { LastResearchedAtComponent, ID as LastResearchedAtComponentID } from "components/LastResearchedAtComponent.sol";

import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

import { LibResearch } from "libraries/LibResearch.sol";
import { LibEncode } from "libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 researchItem = abi.decode(args, (uint256));

    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    LastResearchedAtComponent lastResearchedAtComponent = LastResearchedAtComponent(
      getAddressById(components, LastResearchedAtComponentID)
    );

    // Research FastMiner with 100 IronResource and 100 CopperResource
    if (LibEncode.hashEqual(researchItem, FastMinerResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IronResourceItemID,
        100,
        CopperResourceItemID,
        100,
        FastMinerResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Copper with 30 IronResource
    else if (LibEncode.hashEqual(researchItem, CopperResearchID)) {
      LibResearch.researchWithOneItem(
        itemComponent,
        researchComponent,
        IronResourceItemID,
        30,
        CopperResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research PlatingFactory with 200 IronResource and 200 CopperResource
    else if (LibEncode.hashEqual(researchItem, PlatingFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IronResourceItemID,
        200,
        CopperResourceItemID,
        200,
        PlatingFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Lithium with 20 IronPlateCrafted and 100 CopperResource
    else if (LibEncode.hashEqual(researchItem, LithiumResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IronPlateCraftedItemID,
        20,
        CopperResourceItemID,
        100,
        LithiumResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research BasicBatteryFactory with 50 IronPlateCrafted and 100 LithiumResource
    else if (LibEncode.hashEqual(researchItem, BasicBatteryFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IronPlateCraftedItemID,
        50,
        LithiumResourceItemID,
        100,
        BasicBatteryFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research KineticMissileFactory with 50 BasicPowerSourceCrafted and 100 IronResource
    else if (LibEncode.hashEqual(researchItem, KineticMissileFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        BasicPowerSourceCraftedItemID,
        50,
        IronResourceItemID,
        100,
        KineticMissileFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Titanium with 50 BasicPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, TitaniumResearchID)) {
      LibResearch.researchWithOneItem(
        itemComponent,
        researchComponent,
        BasicPowerSourceCraftedItemID,
        50,
        TitaniumResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research ProjectileLauncher with 50 BasicPowerSourceCrafted and 500 TitaniumResource
    else if (LibEncode.hashEqual(researchItem, ProjectileLauncherResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        BasicPowerSourceCraftedItemID,
        50,
        TitaniumResourceItemID,
        500,
        ProjectileLauncherResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research HardenedDrill with 200 TitaniumResource, 500 IronPlateCrafted, and 50 BasicPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, HardenedDrillResearchID)) {
      LibResearch.researchWithThreeItems(
        itemComponent,
        researchComponent,
        TitaniumResourceItemID,
        200,
        IronPlateCraftedItemID,
        500,
        BasicPowerSourceCraftedItemID,
        50,
        HardenedDrillResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Osmium with 300 TitaniumResource
    else if (LibEncode.hashEqual(researchItem, OsmiumResearchID)) {
      LibResearch.researchWithOneItem(
        itemComponent,
        researchComponent,
        TitaniumResourceItemID,
        300,
        OsmiumResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research DenseMetalRefinery with 100 OsmiumResource, 300 TitaniumResource, and 100 BasicPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, DenseMetalRefineryResearchID)) {
      LibResearch.researchWithThreeItems(
        itemComponent,
        researchComponent,
        OsmiumResourceItemID,
        100,
        TitaniumResourceItemID,
        300,
        BasicPowerSourceCraftedItemID,
        100,
        DenseMetalRefineryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research AdvancedBatteryFactory with 200 OsmiumResource, 100 IronPlateCrafted, and 400 TitaniumResource
    else if (LibEncode.hashEqual(researchItem, AdvancedBatteryFactoryResearchID)) {
      LibResearch.researchWithThreeItems(
        itemComponent,
        researchComponent,
        OsmiumResourceItemID,
        200,
        IronPlateCraftedItemID,
        100,
        TitaniumResourceItemID,
        400,
        AdvancedBatteryFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
    else if (LibEncode.hashEqual(researchItem, TungstenResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        RefinedOsmiumCraftedItemID,
        100,
        TitaniumResourceItemID,
        200,
        TungstenResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research HighTempFoundry with 200 TungstenResource, 100 OsmiumResource, 50 AdvancedPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, HighTempFoundryResearchID)) {
      LibResearch.researchWithThreeItems(
        itemComponent,
        researchComponent,
        TungstenResourceItemID,
        200,
        OsmiumResourceItemID,
        100,
        AdvancedPowerSourceCraftedItemID,
        50,
        HighTempFoundryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Iridium with 100 TungstenRodCrafted 100 OsmiumResource
    else if (LibEncode.hashEqual(researchItem, IridiumResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        TungstenRodsCraftedItemID,
        100,
        OsmiumResourceItemID,
        100,
        IridiumResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research PrecisionMachineryFactory with 200 IridiumResource and 100 TungstenRodsCrafted
    else if (LibEncode.hashEqual(researchItem, PrecisionMachineryFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumResourceItemID,
        200,
        TungstenRodsCraftedItemID,
        100,
        PrecisionMachineryFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research IridiumDrillbitFactory with 100 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, IridiumDrillbitFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        100,
        LaserPowerSourceCraftedItemID,
        20,
        IridiumDrillbitFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research PrecisionPneumaticDrill with 200 TungstenRodsCrafted and 50 IridiumDrillbitCrafted
    else if (LibEncode.hashEqual(researchItem, PrecisionPneumaticDrillResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        TungstenRodsCraftedItemID,
        200,
        IridiumDrillbitCraftedItemID,
        50,
        PrecisionPneumaticDrillResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research PenetratorFactory with 500 OsmiumResource and 50 AdvancedPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, PenetratorFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        OsmiumResourceItemID,
        500,
        AdvancedPowerSourceCraftedItemID,
        50,
        PenetratorFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research PenetratingMissileFactory with 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, PenetratingMissileFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        RefinedOsmiumCraftedItemID,
        100,
        AdvancedPowerSourceCraftedItemID,
        50,
        PenetratingMissileFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research MissileLaunchComplex with 50 TungstenRodsCrafted and 100 AdvancedPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, MissileLaunchComplexResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        TungstenRodsCraftedItemID,
        50,
        AdvancedPowerSourceCraftedItemID,
        100,
        MissileLaunchComplexResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research HighEnergyLaserFactory with 200 IridiumCrystalCrafted 150 AdvancedPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, HighEnergyLaserFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        200,
        AdvancedPowerSourceCraftedItemID,
        150,
        HighEnergyLaserFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research ThermobaricWarheadFactory with 200 IridiumCrystalCrafted
    else if (LibEncode.hashEqual(researchItem, ThermobaricWarheadFactoryResearchID)) {
      LibResearch.researchWithOneItem(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        200,
        ThermobaricWarheadFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Resesarch ThermobaricMissileFactory with 200 IridiumCrystalCrafted and 100 TungstenRodsCrafted
    else if (LibEncode.hashEqual(researchItem, ThermobaricMissileFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        200,
        TungstenRodsCraftedItemID,
        100,
        ThermobaricMissileFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research Kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
    else if (LibEncode.hashEqual(researchItem, KimberliteResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        100,
        TungstenResourceItemID,
        100,
        KimberliteResearchID,
        addressToEntity(msg.sender)
      );
    }
    // Research KimberliteCatalystFactory with 300 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (LibEncode.hashEqual(researchItem, KimberliteCatalystFactoryResearchID)) {
      LibResearch.researchWithTwoItems(
        itemComponent,
        researchComponent,
        IridiumCrystalCraftedItemID,
        300,
        LaserPowerSourceCraftedItemID,
        20,
        KimberliteCatalystFactoryResearchID,
        addressToEntity(msg.sender)
      );
    }
    // no research objective found
    else {
      revert("[ResearchSystem] Not a valid research objective ID");
    }

    LibResearch.setLastResearched(lastResearchedAtComponent, researchItem, addressToEntity(msg.sender));
    return abi.encode(true);
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
