// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../PrimodiumTest.t.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "../../systems/UpgradeBuildingSystem.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";

import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "../../components/LevelComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "../../components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import "../../prototypes.sol";
import { Coord } from "../../types.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibMath } from "../../libraries/LibMath.sol";
import { BuildingKey } from "../../prototypes.sol";
import { ResourceValue, ResourceValues } from "../../types.sol";

contract UpgradeBuildingSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    spawn(alice);
  }

  function testFailUpgradeNonUpgradableBuilding() public {
    vm.startPrank(alice);
    Coord memory coord = getCoord3(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
    upgradeBuildingSystem.executeTyped(coord);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    vm.startPrank(alice);
    Coord memory coord = getCoord1(alice);
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    buildSystem.executeTyped(DebugIronMineNoTileReqID, coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 1, "building should be level 1");
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 2, "building should be level 2");
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 3, "building should be level 3");
    vm.stopPrank();
  }

  function testFailUpgradeMaxLevelReached() public {
    vm.startPrank(alice);
    Coord memory coord = getCoord3(alice);
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    buildSystem.executeTyped(DebugIronMineNoTileReqID, coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 1, "building should be level 1");
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 2, "building should be level 2");
    upgradeBuildingSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.hashKeyCoord(BuildingKey, coord)), 3, "building should be level 3");
    upgradeBuildingSystem.executeTyped(coord);
    //should fail
    vm.stopPrank();
  }

  function testUpgradeUtilityProduction() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );

    buildSystem.executeTyped(DebugUtilityProductionBuilding, getCoord3(alice));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      10,
      "Electricity Storage should be 10"
    );
    buildSystem.executeTyped(DebugSimpleBuildingUtilityResourceRequirement, getCoord1(alice));
    assertEq(
      occupiedUtilityResourceComponent.getValue(
        LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))
      ),
      2,
      "used up electricity should be 2"
    );
    upgradeBuildingSystem.executeTyped(getCoord3(alice));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      20,
      "Electricity Storage should be 20"
    );

    vm.stopPrank();
  }

  function testUpgrade() public {
    vm.startPrank(alice);

    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      component(P_RequiredResourcesComponentID)
    );

    Coord memory mainBaseCoord = getMainBaseCoord(alice);
    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, mainBaseCoord);
    assertTrue(levelComponent.has(buildingEntity), "MainBase entity id should have building component");
    assertTrue(levelComponent.getValue(buildingEntity) == 1, "MainBase entity id should be level 1");
    console.log("upgrading MainBase to level 2");

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(
      LibEncode.hashKeyEntity(MainBaseID, 2)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      console.log(
        "MainBase level 2 requires resource: %s of amount %s",
        requiredResources.resources[i],
        requiredResources.values[i]
      );
      componentDevSystem.executeTyped(
        ItemComponentID,
        LibEncode.hashKeyEntity(requiredResources.resources[i], addressToEntity(alice)),
        abi.encode(requiredResources.values[i])
      );

      console.log("%s of amount %s provided to player", requiredResources.resources[i], requiredResources.values[i]);
    }
    upgradeBuildingSystem.executeTyped(mainBaseCoord);
    assertTrue(levelComponent.getValue(buildingEntity) == 2);

    vm.stopPrank();
  }

  function testFailUpgradeResourceRequirementsNotMet() public {
    vm.startPrank(alice);

    Coord memory coord = getMainBaseCoord(alice);
    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);

    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));

    assertTrue(levelComponent.has(buildingEntity));
    assertTrue(levelComponent.getValue(buildingEntity) == 1);

    upgradeBuildingSystem.executeTyped(coord);
    vm.stopPrank();
  }

  function testFailUpgradeProductionRequirementsNotMet() public {
    vm.startPrank(alice);
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    Coord memory coord1 = getCoord3(alice);
    buildSystem.executeTyped(DebugIronMineID, coord1);
    Coord memory coord2 = getCoord1(alice);
    buildSystem.executeTyped(DebugIronPlateFactoryID, coord2);

    UpgradeBuildingSystem upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    upgradeBuildingSystem.executeTyped(coord2);

    vm.stopPrank();
  }
}
