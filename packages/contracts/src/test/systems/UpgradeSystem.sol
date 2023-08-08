// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../PrimodiumTest.t.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { UpgradeSystem, ID as UpgradeSystemID } from "../../systems/UpgradeSystem.sol";

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

contract UpgradeSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testFailUpgradeNonUpgradableBuilding() public {
    vm.startPrank(alice);
    Coord memory coord = getOrigin(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
    upgradeSystem.executeTyped(coord);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    vm.startPrank(alice);
    Coord memory coord = getOrigin(alice);
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    buildSystem.executeTyped(DebugIronMineNoTileReqID, coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 1, "building should be level 1");
    upgradeSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 2, "building should be level 2");
    upgradeSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 3, "building should be level 3");
    vm.stopPrank();
  }

  function testFailUpgradeMaxLevelReached() public {
    vm.startPrank(alice);
    Coord memory coord = getOrigin(alice);
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    buildSystem.executeTyped(DebugIronMineNoTileReqID, coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 1, "building should be level 1");
    upgradeSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 2, "building should be level 2");
    upgradeSystem.executeTyped(coord);
    assertEq(levelComponent.getValue(LibEncode.encodeCoordEntity(coord, BuildingKey)), 3, "building should be level 3");
    upgradeSystem.executeTyped(coord);
    //should fail
    vm.stopPrank();
  }

  function testUpgradeUtilityProduction() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(component(MaxUtilityComponentID));
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      component(OccupiedUtilityResourceComponentID)
    );

    buildSystem.executeTyped(DebugUtilityProductionBuilding, getOrigin(alice));
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
    upgradeSystem.executeTyped(getOrigin(alice));
    assertEq(
      maxUtilityComponent.getValue(LibEncode.hashKeyEntity(ElectricityUtilityResourceID, addressToEntity(alice))),
      20,
      "Electricity Storage should be 20"
    );

    vm.stopPrank();
  }

  function testUpgrade() public {
    vm.startPrank(alice);

    Coord memory coord = getOrigin(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));

    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      component(P_RequiredResourcesComponentID)
    );
    console.log("building MainBase");
    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, coord);
    console.log("MainBase built");
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    console.log("get built MainBase entity id ");
    assertTrue(levelComponent.has(blockEntityID), "MainBase entity id should have building component");
    assertTrue(levelComponent.getValue(blockEntityID) == 1, "MainBase entity id should be level 1");
    console.log("upgrading MainBase to level 2");

    ComponentDevSystem componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));

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
    upgradeSystem.executeTyped(coord);
    assertTrue(levelComponent.getValue(blockEntityID) == 2);

    vm.stopPrank();
  }

  function testFailUpgradeResourceRequirementsNotMet() public {
    vm.startPrank(alice);

    Coord memory coord = getOrigin(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    UpgradeSystem upgradeSystem = UpgradeSystem(system(UpgradeSystemID));
    LevelComponent levelComponent = LevelComponent(component(BuildingComponentID));

    bytes memory blockEntity = buildSystem.executeTyped(MainBaseID, coord);
    uint256 blockEntityID = abi.decode(blockEntity, (uint256));
    assertTrue(levelComponent.has(blockEntityID));
    assertTrue(levelComponent.getValue(blockEntityID) == 1);

    upgradeSystem.executeTyped(coord);
    vm.stopPrank();
  }
}
