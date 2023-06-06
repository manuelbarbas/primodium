// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";

import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
// debug buildings
import { MainBaseID, ConveyorID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";
import { LibBuild } from "../libraries/LibBuild.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    // Check there isn't another tile there
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 0, "[BuildSystem] Cannot build on a non-empty coordinate");

    // Check if the player has enough resources to build
    // debug buildings are free:  ConveyorID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (
      blockType == ConveyorID ||
      blockType == MinerID ||
      blockType == LithiumMinerID ||
      blockType == BulletFactoryID ||
      blockType == SiloID
    ) {
      // debug buildings, do nothing
      if (!LibDebug.isDebug()) {
        revert("[BuildSystem] Debug buildings are not allowed to be built");
      }
    } else if (blockType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(addressToEntity(msg.sender))) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(addressToEntity(msg.sender), coord);
      }
    }
    // Build BasicMiner with 100 IronResource
    else if (blockType == BasicMinerID) {
      LibBuild.buildWithOneItem(itemComponent, IronResourceItemID, 100, addressToEntity(msg.sender));
    }
    // Build Node with 50 IronResource
    else if (blockType == NodeID) {
      LibBuild.buildWithOneItem(itemComponent, IronResourceItemID, 50, addressToEntity(msg.sender));
    }
    // Build PlatingFactory with 100 IronResource and 50 CopperResource
    else if (blockType == PlatingFactoryID) {
      if (!LibResearch.hasResearchedWithKey(researchComponent, PlatingFactoryResearchID, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched PlatingFactory");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        IronResourceItemID,
        100,
        CopperResourceItemID,
        50,
        addressToEntity(msg.sender)
      );
    }
    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    else if (blockType == BasicBatteryFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(researchComponent, BasicBatteryFactoryResearchID, addressToEntity(msg.sender))
      ) {
        revert("[BuildSystem] You have not researched BasicBatteryFactory");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        IronPlateCraftedItemID,
        20,
        CopperResourceItemID,
        50,
        addressToEntity(msg.sender)
      );
    }
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
    else if (blockType == KineticMissileFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          KineticMissileFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched KineticMissileFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        IronPlateCraftedItemID,
        100,
        LithiumResourceItemID,
        50,
        BasicPowerSourceCraftedItemID,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    else if (blockType == ProjectileLauncherID) {
      if (
        !LibResearch.hasResearchedWithKey(researchComponent, ProjectileLauncherResearchID, addressToEntity(msg.sender))
      ) {
        revert("[BuildSystem] You have not researched ProjectileLauncher");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        IronPlateCraftedItemID,
        100,
        TitaniumResourceItemID,
        100,
        addressToEntity(msg.sender)
      );
    }
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    else if (blockType == HardenedDrillID) {
      if (!LibResearch.hasResearchedWithKey(researchComponent, HardenedDrillResearchID, addressToEntity(msg.sender))) {
        revert("[BuildSystem] You have not researched HardenedDrill");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        TitaniumResourceItemID,
        100,
        IronPlateCraftedItemID,
        10,
        BasicPowerSourceCraftedItemID,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    else if (blockType == DenseMetalRefineryID) {
      if (
        !LibResearch.hasResearchedWithKey(researchComponent, DenseMetalRefineryResearchID, addressToEntity(msg.sender))
      ) {
        revert("[BuildSystem] You have not researched DenseMetalRefinery");
      }
      LibBuild.buildWithFourItems(
        itemComponent,
        OsmiumResourceItemID,
        50,
        TitaniumResourceItemID,
        100,
        IronPlateCraftedItemID,
        30,
        BasicPowerSourceCraftedItemID,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    else if (blockType == AdvancedBatteryFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          AdvancedBatteryFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched AdvancedBatteryFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        OsmiumResourceItemID,
        150,
        TitaniumResourceItemID,
        50,
        BasicPowerSourceCraftedItemID,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    else if (blockType == HighTempFoundryID) {
      if (
        !LibResearch.hasResearchedWithKey(researchComponent, HighTempFoundryResearchID, addressToEntity(msg.sender))
      ) {
        revert("[BuildSystem] You have not researched HighTempFoundry");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        TungstenResourceItemID,
        50,
        RefinedOsmiumCraftedItemID,
        50,
        AdvancedPowerSourceCraftedItemID,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PrecisionMachineryFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          PrecisionMachineryFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched PrecisionMachineryFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        IridiumResourceItemID,
        50,
        TungstenRodsCraftedItemID,
        50,
        AdvancedPowerSourceCraftedItemID,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
    else if (blockType == IridiumDrillbitFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          IridiumDrillbitFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched IridiumDrillbitFactory");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        TungstenRodsCraftedItemID,
        50,
        LaserPowerSourceCraftedItemID,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
    else if (blockType == PrecisionPneumaticDrillID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          PrecisionPneumaticDrillResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched PrecisionPneumaticDrill");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        TungstenResourceItemID,
        100,
        OsmiumResourceItemID,
        100,
        LaserPowerSourceCraftedItemID,
        5,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
    else if (blockType == PenetratorFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(researchComponent, PenetratorFactoryResearchID, addressToEntity(msg.sender))
      ) {
        revert("[BuildSystem] You have not researched PenetratorFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        OsmiumResourceItemID,
        200,
        IronPlateCraftedItemID,
        50,
        AdvancedPowerSourceCraftedItemID,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    else if (blockType == PenetratingMissileFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          PenetratingMissileFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched PenetratingMissileFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        OsmiumResourceItemID,
        300,
        TitaniumResourceItemID,
        100,
        AdvancedPowerSourceCraftedItemID,
        15,
        addressToEntity(msg.sender)
      );
    }
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    else if (blockType == MissileLaunchComplexID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          MissileLaunchComplexResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched MissileLaunchComplex");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        TungstenRodsCraftedItemID,
        100,
        OsmiumResourceItemID,
        100,
        addressToEntity(msg.sender)
      );
    }
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    else if (blockType == HighEnergyLaserFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          HighEnergyLaserFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched HighEnergyLaserFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        IridiumCrystalCraftedItemID,
        50,
        RefinedOsmiumCraftedItemID,
        100,
        AdvancedPowerSourceCraftedItemID,
        50,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    else if (blockType == ThermobaricWarheadFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          ThermobaricWarheadFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched ThermobaricWarheadFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        RefinedOsmiumCraftedItemID,
        200,
        IridiumCrystalCraftedItemID,
        100,
        LaserPowerSourceCraftedItemID,
        10,
        addressToEntity(msg.sender)
      );
    }
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == ThermobaricMissileFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          ThermobaricMissileFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched ThermobaricMissileFactory");
      }
      LibBuild.buildWithThreeItems(
        itemComponent,
        IridiumCrystalCraftedItemID,
        100,
        TungstenRodsCraftedItemID,
        100,
        LaserPowerSourceCraftedItemID,
        20,
        addressToEntity(msg.sender)
      );
    }
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    else if (blockType == KimberliteCatalystFactoryID) {
      if (
        !LibResearch.hasResearchedWithKey(
          researchComponent,
          KimberliteCatalystFactoryResearchID,
          addressToEntity(msg.sender)
        )
      ) {
        revert("[BuildSystem] You have not researched KimberliteCatalystFactory");
      }
      LibBuild.buildWithTwoItems(
        itemComponent,
        IridiumCrystalCraftedItemID,
        200,
        LaserPowerSourceCraftedItemID,
        20,
        addressToEntity(msg.sender)
      );
    } else {
      revert("[BuildSystem] Invalid block type");
    }

    // Randomly generate IDs instead of basing on coordinate
    uint256 newBlockEntity = world.getUniqueEntityId();

    // Standardize storing uint256 as uint160 because entity IDs are converted to addresses before hashing
    uint256 blockEntity = addressToEntity(entityToAddress(newBlockEntity));

    positionComponent.set(blockEntity, coord);
    tileComponent.set(blockEntity, blockType);
    ownedByComponent.set(blockEntity, addressToEntity(msg.sender));
    lastBuiltAtComponent.set(blockEntity, block.number);

    return abi.encode(blockEntity);
  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(blockType, coord));
  }
}
