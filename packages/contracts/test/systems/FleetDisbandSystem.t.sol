// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit, EFleetStance } from "src/types.sol";
import { UnitKey } from "src/Keys.sol";

import { P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, P_Unit, FleetMovement, UnitLevel, FleetStance, OwnedBy, P_RequiredResources, P_RequiredResourcesData, P_IsUtility } from "codegen/index.sol";

contract FleetDisbandSystemTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);

    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);
  }

  function testDisbandFleet() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.warp(block.timestamp + 1);

    vm.startPrank(alice);
    world.Primodium__disbandFleet(fleetEntity);
    vm.stopPrank();
    assertEq(UnitCount.get(fleetEntity, unitPrototype), 0, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 0, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 0, "fleet resource count doesn't match");

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          requiredResources.amounts[i],
          "asteroid resource utility was not refunded correctly after disband"
        );
    }
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
    assertEq(OwnedBy.get(fleetEntity), aliceHomeAsteroid, "fleet owned by doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(FleetMovement.getDestination(fleetEntity), aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetStance.getStance(fleetEntity), uint8(EFleetStance.NULL), "fleet stance doesn't match");
  }

  function testDisbandResourcesFleet() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.warp(block.timestamp + 1);

    vm.startPrank(alice);
    world.Primodium__disbandResources(fleetEntity, resourceCounts);
    vm.stopPrank();

    assertEq(UnitCount.get(fleetEntity, unitPrototype), 1, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 0, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 0, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
  }

  function testFailDisbandUnitsCargo() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron))
        resourceCounts[i] = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype)) + 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__disbandUnits(fleetEntity, unitCounts);
    vm.stopPrank();
  }

  function testFailDisbandUnitsNotInOrbit() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.warp(block.timestamp + 1);

    vm.startPrank(alice);
    world.Primodium__disbandUnits(fleetEntity, unitCounts);
    vm.stopPrank();
  }

  function testDisbandUnitsNoUnitsLeftReset() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetEntity));

    vm.startPrank(alice);
    world.Primodium__disbandUnits(fleetEntity, unitCounts);
    vm.stopPrank();

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          requiredResources.amounts[i],
          "asteroid resource utility was not refunded correctly after disband"
        );
    }
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
    assertEq(OwnedBy.get(fleetEntity), aliceHomeAsteroid, "fleet owned by doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(FleetMovement.getDestination(fleetEntity), aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetStance.getStance(fleetEntity), uint8(EFleetStance.NULL), "fleet stance doesn't match");
  }
}
