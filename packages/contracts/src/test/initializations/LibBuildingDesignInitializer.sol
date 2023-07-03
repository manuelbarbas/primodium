// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "../../components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

import { Coord } from "../../types.sol";

// in-game blocks/factories
import { MainBaseID, BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../../prototypes/Tiles.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibBuildingDesignInitializerTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuildingsHaveCorrectRequirements() public {
    vm.startPrank(alice);
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      component(RequiredResourcesComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      component(RequiredResearchComponentID)
    );
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));
    assertTrue(!requiredResearchComponent.has(BasicMinerID));
    assertTrue(requiredResourcesComponent.has(BasicMinerID));

    console.log("BasicMinerID requirements:");
    uint256[] memory resources = requiredResourcesComponent.getValue(BasicMinerID);
    console.log("Resources:");
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], BasicMinerID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], BasicMinerID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], BasicMinerID)));
    }

    assertTrue(!requiredResearchComponent.has(NodeID));
    assertTrue(requiredResourcesComponent.has(NodeID));

    console.log("NodeID requirements:");
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(NodeID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], NodeID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], NodeID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], NodeID)));
    }

    assertTrue(requiredResearchComponent.has(PlatingFactoryID));
    assertTrue(requiredResourcesComponent.has(PlatingFactoryID));
    console.log("PlatingFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(PlatingFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(PlatingFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], PlatingFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PlatingFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PlatingFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(BasicBatteryFactoryID));
    assertTrue(requiredResourcesComponent.has(BasicBatteryFactoryID));
    console.log("BasicBatteryFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(BasicBatteryFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(BasicBatteryFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], BasicBatteryFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], BasicBatteryFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], BasicBatteryFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(KineticMissileFactoryID));
    assertTrue(requiredResourcesComponent.has(KineticMissileFactoryID));
    console.log("KineticMissileFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(KineticMissileFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(KineticMissileFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], KineticMissileFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], KineticMissileFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], KineticMissileFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(ProjectileLauncherID));
    assertTrue(requiredResourcesComponent.has(ProjectileLauncherID));
    console.log("ProjectileLauncherID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(ProjectileLauncherID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(ProjectileLauncherID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], ProjectileLauncherID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ProjectileLauncherID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ProjectileLauncherID)));
    }

    assertTrue(requiredResearchComponent.has(HardenedDrillID));
    assertTrue(requiredResourcesComponent.has(HardenedDrillID));
    console.log("HardenedDrillID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(HardenedDrillID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(HardenedDrillID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], HardenedDrillID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HardenedDrillID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HardenedDrillID)));
    }

    assertTrue(requiredResearchComponent.has(DenseMetalRefineryID));
    assertTrue(requiredResourcesComponent.has(DenseMetalRefineryID));
    console.log("DenseMetalRefineryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(DenseMetalRefineryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(DenseMetalRefineryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], DenseMetalRefineryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], DenseMetalRefineryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], DenseMetalRefineryID)));
    }

    assertTrue(requiredResearchComponent.has(AdvancedBatteryFactoryID));
    assertTrue(requiredResourcesComponent.has(AdvancedBatteryFactoryID));
    console.log("AdvancedBatteryFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(AdvancedBatteryFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(AdvancedBatteryFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], AdvancedBatteryFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], AdvancedBatteryFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], AdvancedBatteryFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(HighTempFoundryID));
    assertTrue(requiredResourcesComponent.has(HighTempFoundryID));
    console.log("HighTempFoundryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(HighTempFoundryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(HighTempFoundryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], HighTempFoundryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HighTempFoundryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HighTempFoundryID)));
    }

    assertTrue(requiredResearchComponent.has(PrecisionMachineryFactoryID));
    assertTrue(requiredResourcesComponent.has(PrecisionMachineryFactoryID));
    console.log("PrecisionMachineryFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(PrecisionMachineryFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(PrecisionMachineryFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], PrecisionMachineryFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PrecisionMachineryFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PrecisionMachineryFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(IridiumDrillbitFactoryID));
    assertTrue(requiredResourcesComponent.has(IridiumDrillbitFactoryID));
    console.log("IridiumDrillbitFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(IridiumDrillbitFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(IridiumDrillbitFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], IridiumDrillbitFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], IridiumDrillbitFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], IridiumDrillbitFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(PrecisionPneumaticDrillID));
    assertTrue(requiredResourcesComponent.has(PrecisionPneumaticDrillID));
    console.log("PrecisionPneumaticDrillID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(PrecisionPneumaticDrillID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(PrecisionPneumaticDrillID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], PrecisionPneumaticDrillID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PrecisionPneumaticDrillID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PrecisionPneumaticDrillID)));
    }

    assertTrue(requiredResearchComponent.has(PenetratorFactoryID));
    assertTrue(requiredResourcesComponent.has(PenetratorFactoryID));
    console.log("PenetratorFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(PenetratorFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(PenetratorFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], PenetratorFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PenetratorFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PenetratorFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(PenetratingMissileFactoryID));
    assertTrue(requiredResourcesComponent.has(PenetratingMissileFactoryID));
    console.log("PenetratingMissileFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(PenetratingMissileFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(PenetratingMissileFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], PenetratingMissileFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PenetratingMissileFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], PenetratingMissileFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(MissileLaunchComplexID));
    assertTrue(requiredResourcesComponent.has(MissileLaunchComplexID));
    console.log("MissileLaunchComplexID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(MissileLaunchComplexID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(MissileLaunchComplexID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], MissileLaunchComplexID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], MissileLaunchComplexID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], MissileLaunchComplexID)));
    }

    assertTrue(requiredResearchComponent.has(HighEnergyLaserFactoryID));
    assertTrue(requiredResourcesComponent.has(HighEnergyLaserFactoryID));
    console.log("HighEnergyLaserFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(HighEnergyLaserFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(HighEnergyLaserFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], HighEnergyLaserFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HighEnergyLaserFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], HighEnergyLaserFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(ThermobaricWarheadFactoryID));
    assertTrue(requiredResourcesComponent.has(ThermobaricWarheadFactoryID));
    console.log("ThermobaricWarheadFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(ThermobaricWarheadFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(ThermobaricWarheadFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], ThermobaricWarheadFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ThermobaricWarheadFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ThermobaricWarheadFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(ThermobaricMissileFactoryID));
    assertTrue(requiredResourcesComponent.has(ThermobaricMissileFactoryID));
    console.log("ThermobaricMissileFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(ThermobaricMissileFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(ThermobaricMissileFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], ThermobaricMissileFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ThermobaricMissileFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], ThermobaricMissileFactoryID)));
    }

    assertTrue(requiredResearchComponent.has(KimberliteCatalystFactoryID));
    assertTrue(requiredResourcesComponent.has(KimberliteCatalystFactoryID));
    console.log("KimberliteCatalystFactoryID requirements:");
    console.log("Research:");
    console.log(requiredResearchComponent.getValue(KimberliteCatalystFactoryID));
    console.log("Resources:");
    resources = requiredResourcesComponent.getValue(KimberliteCatalystFactoryID);
    for (uint256 i = 0; i < resources.length; i++) {
      assertTrue(itemComponent.has(LibEncode.hashKeyEntity(resources[i], KimberliteCatalystFactoryID)));
      assertTrue(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], KimberliteCatalystFactoryID)) > 0);
      console.log("id:");
      console.log(resources[i]);
      console.log("value:");
      console.log(itemComponent.getValue(LibEncode.hashKeyEntity(resources[i], KimberliteCatalystFactoryID)));
    }

    vm.stopPrank();
  }
}
