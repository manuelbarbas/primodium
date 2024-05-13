// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";
import { EResource, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";
import { LibColony } from "libraries/LibColony.sol";

import { P_GameConfig, CooldownEnd, Home, P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, FleetMovement, P_RequiredResources, P_RequiredResourcesData, UnitLevel, P_IsUtility, MaxColonySlots } from "codegen/index.sol";

contract TransferSystemTest is PrimodiumTest {
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

  function sendBobFleetToAliceAsteroid(bytes32 bobFleetEntity) private {
    vm.prank(creator);
    P_GameConfig.setWorldSpeed(100);
    vm.prank(bob);
    world.Primodium__sendFleet(bobFleetEntity, aliceHomeAsteroid);
    console.log("aliceFleet arrival time", FleetMovement.getArrivalTime(bobFleetEntity));
    vm.warp(block.timestamp + 10000000);
  }

  // - left and right arent owned by player
  function testTransferTwoWayNotOwned() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 bobFleetEntity = spawnFleetWithUnitAndResource(
      bobHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    sendBobFleetToAliceAsteroid(bobFleetEntity);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Both entities not owned by player");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, bobFleetEntity, resources);
    vm.expectRevert("[TransferTwoWay] Both entities not owned by player");
    world.Primodium__transferResourcesTwoWay(bobFleetEntity, aliceFleetEntity, resources);
  }
  // - left and right arent at the same location
  function testTransferTwoWayNotSameLocation() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);
    vm.warp(block.timestamp + 10000000);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Entities not at same location");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  // - left or right is in transit
  function testTransferTwoWayInTransit() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);
    vm.warp(block.timestamp + 10000000);

    vm.prank(alice);
    world.Primodium__sendFleet(aliceFleetEntity, aliceHomeAsteroid);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Fleet not at destination");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet not at destination");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet not at destination");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet not at destination");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  // - left and right both not fleet
  function testTransferTwoWayBothNotFleet() public {
    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(100);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] At least one entity must be a fleet");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, bobHomeAsteroid, resources);

    vm.expectRevert("[TransferTwoWay] At least one entity must be a fleet");
    world.Primodium__transferResourcesTwoWay(bobHomeAsteroid, aliceHomeAsteroid, resources);
  }
  // - left or right is in cooldown
  function testTransferTwoWayInCooldown() public {
    uint256 ironCount = 100;
    bytes32 aliceFleetEntity = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );
    bytes32 aliceFleetEntity2 = spawnFleetWithUnitAndResource(
      aliceHomeAsteroid,
      EUnit.AegisDrone,
      100,
      EResource.Iron,
      ironCount
    );

    vm.prank(creator);
    CooldownEnd.set(aliceFleetEntity, block.timestamp + 1);
    vm.startPrank(alice);

    int256[] memory resources = new int256[](P_Transportables.length());
    for (uint256 i = 0; i < resources.length; i++) {
      if (P_Transportables.getItemValue(i) == Iron) resources[i] = int256(ironCount);
    }
    vm.startPrank(alice);
    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceFleetEntity2, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceHomeAsteroid, aliceFleetEntity, resources);

    vm.expectRevert("[TransferTwoWay] Fleet is in cooldown");
    world.Primodium__transferResourcesTwoWay(aliceFleetEntity, aliceHomeAsteroid, resources);
  }

  // - resources two way
  // - resources two way with intermediary cargo overflow
  // - resources two way with intermediary utility overflow
  // - resources length wrong

  // - units two way
  // - resources two way with intermediary cargo overflow
  // - resources two way with intermediary utility overflow
  // - units length wrong

  // - units and resources two way
  // - units and resources two way with intermediary cargo overflow
  // - units and resources two way with intermediary utility overflow
  // - units or resources length wrong
}
