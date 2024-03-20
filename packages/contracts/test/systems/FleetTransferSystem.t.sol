// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { CapitalShipPrototypeId } from "codegen/Prototypes.sol";
import { EResource, EUnit } from "src/types.sol";
import { UnitKey } from "src/Keys.sol";

import { P_GameConfig, CooldownEnd, Home, P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, FleetMovement, P_RequiredResources, P_RequiredResourcesData, UnitLevel, P_IsUtility } from "codegen/index.sol";

contract FleetTransferSystemTest is PrimodiumTest {
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

  function testTransferResourcesAndUnitsFleetToFleet() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__transferUnitsAndResourcesFromFleetToFleet(
      fleetEntity,
      secondFleetEntity,
      unitCounts,
      resourceCounts
    );
    vm.stopPrank();

    assertEq(UnitCount.get(fleetEntity, unitPrototype), 1, "fleet unit count doesn't match");
    assertEq(UnitCount.get(secondFleetEntity, unitPrototype), 3, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 1, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(secondFleetEntity, uint8(EResource.Iron)), 3, "fleet resource count doesn't match");

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          0,
          "no utility should be refunded when transfer is between same owner fleets"
        );
    }
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
  }

  function createCapitalShipFleet(address player) private returns (bytes32 fleetEntity) {
    bytes32 playerEntity = addressToEntity(player);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == CapitalShipPrototypeId) unitCounts[i] = 1;
    }

    bytes32 homeAsteroidEntity = Home.get(playerEntity);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(player, homeAsteroidEntity, unitCounts, resourceCounts);

    vm.prank(player);
    fleetEntity = world.Primodium__createFleet(homeAsteroidEntity, unitCounts, resourceCounts);
  }

  function testTransferCapitalShipBetweenPlayers() public {
    bytes32 aliceFleet = createCapitalShipFleet(alice);
    bytes32 bobFleet = createCapitalShipFleet(bob);

    vm.prank(creator);
    P_GameConfig.setWorldSpeed(100);
    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleet, bobHomeAsteroid);
    console.log("aliceFleet arrival time", FleetMovement.getArrivalTime(aliceFleet));
    vm.warp(block.timestamp + 10000000);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == CapitalShipPrototypeId) unitCounts[i] = 1;
    }

    vm.startPrank(alice);
    vm.expectRevert("[Fleet] Cannot transfer capital ships to other players");
    world.Primodium__transferUnitsFromFleetToFleet(aliceFleet, bobFleet, unitCounts);

    vm.expectRevert("[Fleet] Cannot transfer capital ships to other players");
    world.Primodium__transferUnitsFromFleetToAsteroid(aliceFleet, bobHomeAsteroid, unitCounts);

    vm.expectRevert("[Fleet] Cannot transfer capital ships to other players");
    world.Primodium__transferUnitsAndResourcesFromFleetToAsteroid(
      aliceFleet,
      bobHomeAsteroid,
      unitCounts,
      resourceCounts
    );

    vm.expectRevert("[Fleet] Cannot transfer capital ships to other players");
    world.Primodium__transferUnitsAndResourcesFromFleetToFleet(aliceFleet, bobFleet, unitCounts, resourceCounts);
  }

  function testFailTransferResourcesAndUnitsFleetToFleetNotInSameOrbit() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(secondFleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__transferUnitsAndResourcesFromFleetToFleet(
      fleetEntity,
      secondFleetEntity,
      unitCounts,
      resourceCounts
    );
    vm.stopPrank();
  }

  function testTransferResourcesFleetToFleet() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__transferResourcesFromFleetToFleet(fleetEntity, secondFleetEntity, resourceCounts);
    vm.stopPrank();

    assertEq(UnitCount.get(fleetEntity, unitPrototype), 2, "fleet unit count doesn't match");
    assertEq(UnitCount.get(secondFleetEntity, unitPrototype), 2, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 1, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(secondFleetEntity, uint8(EResource.Iron)), 3, "fleet resource count doesn't match");

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          0,
          "no utility should be refunded when transfer is between same owner fleets"
        );
    }
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid resource count doesn't match");
  }

  function testFailTransferResourcesFleetToFleetNotInSameOrbit() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(secondFleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 0;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__transferResourcesFromFleetToFleet(fleetEntity, secondFleetEntity, resourceCounts);
    vm.stopPrank();
  }

  function testFailTransferUnitsFleetToFleetNotInSameOrbit() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(secondFleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 0;
    }

    vm.startPrank(alice);
    world.Primodium__transferUnitsFromFleetToFleet(fleetEntity, secondFleetEntity, unitCounts);
    vm.stopPrank();
  }

  function testTransferResourcesAndUnitsFleetToAsteroid() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.startPrank(alice);
    world.Primodium__transferUnitsAndResourcesFromFleetToAsteroid(
      fleetEntity,
      aliceHomeAsteroid,
      unitCounts,
      resourceCounts
    );
    vm.stopPrank();

    assertEq(UnitCount.get(fleetEntity, unitPrototype), 1, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 1, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 1, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 1, "fleet resource count doesn't match");

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          0,
          "no utility should be refunded when transfer is between same owner fleets"
        );
    }
  }

  function testTransferResourcesAndUnitsAsteroidToFleet() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    trainUnits(alice, EUnit.MinutemanMarine, 1, true);
    increaseResource(aliceHomeAsteroid, EResource.Iron, 1);

    vm.startPrank(alice);
    world.Primodium__transferUnitsAndResourcesFromAsteroidToFleet(
      aliceHomeAsteroid,
      fleetEntity,
      unitCounts,
      resourceCounts
    );
    vm.stopPrank();

    assertEq(UnitCount.get(fleetEntity, unitPrototype), 3, "fleet unit count doesn't match");
    assertEq(UnitCount.get(aliceHomeAsteroid, unitPrototype), 0, "asteroid unit count doesn't match");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 3, "fleet resource count doesn't match");
    assertEq(ResourceCount.get(aliceHomeAsteroid, uint8(EResource.Iron)), 0, "fleet resource count doesn't match");

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i]))
        assertEq(
          ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
          0,
          "no utility should be refunded when transfer is between same owner fleets"
        );
    }
  }

  function testTransferFailInCooldown() public {
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
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 2;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    increaseResource(aliceHomeAsteroid, EResource.U_MaxFleets, 1);
    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 secondFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = 1;
    }

    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    vm.prank(creator);
    CooldownEnd.set(fleetEntity, block.timestamp + 1);
    vm.startPrank(alice);

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferResourcesFromFleetToFleet(fleetEntity, secondFleetEntity, resourceCounts);

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferUnitsFromFleetToFleet(fleetEntity, secondFleetEntity, unitCounts);

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferUnitsAndResourcesFromFleetToFleet(
      fleetEntity,
      secondFleetEntity,
      unitCounts,
      resourceCounts
    );

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferUnitsFromFleetToAsteroid(fleetEntity, aliceHomeAsteroid, unitCounts);

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferUnitsAndResourcesFromFleetToAsteroid(
      fleetEntity,
      aliceHomeAsteroid,
      unitCounts,
      resourceCounts
    );

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__transferResourcesFromFleetToAsteroid(fleetEntity, aliceHomeAsteroid, resourceCounts);
  }
}
