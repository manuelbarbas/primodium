// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { LastResearchedAtComponent, ID as LastResearchedAtComponentID } from "components/LastResearchedAtComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

import { LibResearch } from "libraries/LibResearch.sol";
import { LibResourceCost } from "libraries/LibResourceCost.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkMainBaseLevelRequirement(
    BuildingComponent buildingComponent,
    uint256 playerEntity,
    uint256 entity
  ) internal view returns (bool) {
    if (!buildingComponent.has(entity)) return true;
    uint256 mainBuildingLevel = LibBuilding.getBaseLevel(buildingComponent, playerEntity);
    return mainBuildingLevel >= buildingComponent.getValue(entity);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 researchItem = abi.decode(args, (uint256));

    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    LastResearchedAtComponent lastResearchedAtComponent = LastResearchedAtComponent(
      getAddressById(components, LastResearchedAtComponentID)
    );
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));

    require(researchComponent.has(researchItem), "[ResearchSystem] Technology not registered");

    require(
      checkMainBaseLevelRequirement(buildingComponent, addressToEntity(msg.sender), researchItem),
      "[ResearchSystem] MainBase level requirement not met"
    );

    require(
      LibResearch.hasResearched(
        requiredResearchComponent,
        researchComponent,
        researchItem,
        addressToEntity(msg.sender)
      ),
      "[ResearchSystem] Research requirements not met"
    );

    require(
      LibResourceCost.checkAndSpendRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        researchItem,
        addressToEntity(msg.sender)
      ),
      "[ResearchSystem] Not enough resources to research"
    );
    researchComponent.set(LibEncode.hashKeyEntity(researchItem, addressToEntity(msg.sender)));
    LibResearch.setResearchTime(lastResearchedAtComponent, researchItem, addressToEntity(msg.sender));
    return abi.encode(true);
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
