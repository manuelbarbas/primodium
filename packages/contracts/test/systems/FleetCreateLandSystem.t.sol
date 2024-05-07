// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit, EFleetStance } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, P_Unit, FleetMovement, UnitLevel, FleetStance, IsFleet, OwnedBy, Points, P_PointMultiplier } from "codegen/index.sol";

contract FleetCreateLandSystemTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);
  }

  function testCreateFleet() public {
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
    assertEq(UnitCount.get(fleetEntity, unitPrototype), 1, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 0, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 1, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
    assertEq(IsFleet.get(fleetEntity), true, "fleet is not a fleet");
    assertEq(OwnedBy.get(fleetEntity), aliceHomeAsteroid, "fleet owned by doesn't match");
    assertEq(FleetMovement.getDestination(fleetEntity), aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetStance.getStance(fleetEntity), uint8(EFleetStance.NULL), "fleet stance doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
  }

  function testLandFleet() public {
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
    world.Primodium__landFleet(fleetEntity, aliceHomeAsteroid);
    vm.stopPrank();
    assertEq(UnitCount.get(fleetEntity, unitPrototype), 0, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 1, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 0, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 1, "asteroid resource count doesn't match");
    assertEq(OwnedBy.get(fleetEntity), aliceHomeAsteroid, "fleet owned by doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(FleetMovement.getDestination(fleetEntity), aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetStance.getStance(fleetEntity), uint8(EFleetStance.NULL), "fleet stance doesn't match");
  }

  function testFailCreateFleetNotEnoughUnits() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) {
        resourceCounts[i] = 1;
        increaseResource(aliceHomeAsteroid, EResource.Iron, 1);
      }
    }
    vm.startPrank(alice);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();
  }

  function testFailCreateFleetNotEnoughResources() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) {
        unitCounts[i] = 1;
        trainUnits(alice, unitPrototypes[i], 1, true);
      }
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Kimberlite)) {
        resourceCounts[i] = 1;
      }
    }

    vm.startPrank(alice);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();
  }

  function testFailCreateFleetNotOwner() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    //create fleet with 1 minuteman marine
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    //try to create fleet by other player
    vm.startPrank(bob);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();
  }

  function testFailCreateFleetNoFleetMovementsLeft() public {
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
    setupCreateFleetNoMaxMovesGranted(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    setupCreateFleetNoMaxMovesGranted(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();
  }

  function testFailCreateFleetNotEnoughCargo() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron))
        resourceCounts[i] = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype)) + 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();
  }
}
