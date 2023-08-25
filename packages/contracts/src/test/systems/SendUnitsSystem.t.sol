// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { SendUnitsSystem, ID as SendUnitsSystemID } from "systems/SendUnitsSystem.sol";
import { TrainUnitsSystem, ID as TrainUnitsSystemID } from "systems/TrainUnitsSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "systems/BuildSystem.sol";

import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";

import { LibSend } from "libraries/LibSend.sol";
import { LibArrival } from "libraries/LibArrival.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";

contract SendUnitsTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ComponentDevSystem public componentDevSystem;
  SendUnitsSystem public sendUnitsSystem;
  TrainUnitsSystem public trainUnitsSystem;
  BuildSystem public buildSystem;

  function setUp() public override {
    super.setUp();

    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    spawn(alice);
    spawn(bob);
    spawn(deployer);
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(alice), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(bob), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(deployer), abi.encode(100));
  }

  function testFailSendUnitsCountZero() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 0);

    vm.expectRevert(bytes("unit count must be positive"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), bob);
  }

  function testFailSendTooFewUnits() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("not enough value to subtract"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), bob);
  }

  function testFailMustSendFromYourAsteroid() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("you can only move from an asteroid you own"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(deployer), getHomeAsteroid(bob), bob);
  }

  function testFailSameRock() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("origin and destination cannot be the same"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(alice), bob);
  }

  function testFailInvadeSameTo() public {
    vm.startPrank(alice);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 10);

    vm.expectRevert(bytes("you cannot invade yourself"));
    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), alice);
  }

  // todo: check motherlode movement rules

  function setupInvasion(uint256 entity) internal {
    vm.roll(0);
    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(alice));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, entity, 10);
  }

  function invade() public returns (Arrival memory) {
    setupInvasion(DebugUnit);
    uint32 attackNumber = 4;
    vm.roll(100);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, attackNumber);

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      bob
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));

    uint32 speed = P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(DebugUnit);
    Coord memory originPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroid(alice)
    );
    Coord memory destinationPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroid(bob)
    );

    uint256 worldSpeed = GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * worldSpeed) / 100 / 100);
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.INVADE,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(alice),
      to: addressToEntity(bob),
      origin: getHomeAsteroid(alice),
      destination: getHomeAsteroid(bob)
    });
    assertEq(arrival, expectedArrival);

    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob))), 1);
    return arrival;
  }

  // Arrival resolution

  function testArrivalTooSoon() public {
    vm.startPrank(alice);
    Arrival memory arrival = invade();
    vm.roll(arrival.arrivalBlock - 1);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(bob), getHomeAsteroid(bob));
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob))), 1);
  }

  function testArrivalExecuted() public {
    vm.startPrank(alice);
    Arrival memory arrival = invade();
    vm.roll(arrival.arrivalBlock);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(bob), getHomeAsteroid(bob));
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob))), 0);
  }

  // testTwoArrivals
  function testOneArrivedOneDidntYet() public {
    vm.startPrank(alice);
    Arrival memory arrival = invade();
    vm.roll(block.number + 10);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 5);

    sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), bob);
    vm.roll(arrival.arrivalBlock);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(bob), arrival.destination);

    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob))), 1);
  }

  function testArrivalSnuckInBehind() public {
    vm.startPrank(alice);
    setupInvasion(DebugUnit);

    uint256 unitProductionBuildingEntityID = LibEncode.hashKeyCoord(BuildingKey, getIronCoord(alice));
    uint256 total = 1000;
    componentDevSystem.executeTyped(
      MaxUtilityComponentID,
      LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice)),
      abi.encode(total)
    );

    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit3, 10);
    vm.roll(block.number + 1000);
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit, 1);

    Arrival memory slowArrival = abi.decode(
      sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), bob),
      (Arrival)
    );
    units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(DebugUnit3, 1);

    Arrival memory arrival2 = abi.decode(
      sendUnitsSystem.executeTyped(units, ESendType.INVADE, getHomeAsteroid(alice), getHomeAsteroid(bob), bob),
      (Arrival)
    );
    vm.roll(arrival2.arrivalBlock);
    vm.stopPrank();
    vm.startPrank(deployer);
    LibArrival.applyArrivals(world, addressToEntity(bob), arrival2.destination);
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob))), 1);
    assertEq(
      ArrivalsList.get(world, LibEncode.hashKeyEntity(addressToEntity(bob), getHomeAsteroid(bob)), 0),
      slowArrival
    );
  }
}
