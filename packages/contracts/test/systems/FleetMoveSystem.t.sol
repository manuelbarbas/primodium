// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibMath } from "libraries/LibMath.sol";

import { P_EnumToPrototype, P_Transportables, P_UnitPrototypes, FleetMovement, UnitLevel, P_GameConfig, P_Unit, Position } from "codegen/index.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";

contract FleetMoveSystemTest is PrimodiumTest {
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

  function testSendFleet() public {
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
    bytes32 fleetEntity = world.Pri_11__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    uint256 speed = P_Unit.getSpeed(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    uint256 arrivalTime = LibFleetMove.getArrivalTime(aliceHomeAsteroid, Position.get(bobHomeAsteroid), speed);

    uint256 correctArrivalTime = block.timestamp +
      ((LibMath.distance(Position.get(aliceHomeAsteroid), Position.get(bobHomeAsteroid)) *
        P_GameConfig.getTravelTime() *
        WORLD_SPEED_SCALE *
        UNIT_SPEED_SCALE) / (P_GameConfig.getWorldSpeed() * speed));

    require(arrivalTime == correctArrivalTime, "arrival time doesn't match");
    vm.startPrank(alice);
    world.Pri_11__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();
    assertEq(FleetMovement.getDestination(fleetEntity), bobHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), correctArrivalTime, "fleet arrival time doesn't match");
    assertEq(FleetMovement.getSendTime(fleetEntity), block.timestamp, "fleet send time doesn't match");
  }

  function testFailSendFleetToOrigin() public {
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
    bytes32 fleetEntity = world.Pri_11__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.Pri_11__sendFleet(fleetEntity, aliceHomeAsteroid);
    vm.stopPrank();
  }

  function testRecallFleet() public {
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
    bytes32 fleetEntity = world.Pri_11__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    uint256 speed = P_Unit.getSpeed(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    uint256 arrivalTime = LibFleetMove.getArrivalTime(aliceHomeAsteroid, Position.get(bobHomeAsteroid), speed);

    //move some time forward so recall doesn't get negative send time
    vm.warp(arrivalTime);

    uint256 sendTime = block.timestamp;
    arrivalTime = LibFleetMove.getArrivalTime(aliceHomeAsteroid, Position.get(bobHomeAsteroid), speed);

    vm.startPrank(alice);
    world.Pri_11__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    uint256 someTimeAmount = ((arrivalTime - block.timestamp) / 2);
    vm.warp(block.timestamp + someTimeAmount);

    vm.startPrank(alice);
    world.Pri_11__recallFleet(fleetEntity);
    vm.stopPrank();

    assertEq(FleetMovement.getDestination(fleetEntity), aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(FleetMovement.getOrigin(fleetEntity), bobHomeAsteroid, "fleet origin doesn't match");
    assertEq(
      FleetMovement.getArrivalTime(fleetEntity),
      block.timestamp + someTimeAmount,
      "fleet arrival time doesn't match"
    );
    assertEq(
      FleetMovement.getSendTime(fleetEntity),
      block.timestamp + someTimeAmount - (arrivalTime - sendTime),
      "fleet send time doesn't match"
    );
  }
}
