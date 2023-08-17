// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { SendUnitsSystem, ID as SendUnitsSystemID } from "systems/SendUnitsSystem.sol";
import { TrainUnitsSystem, ID as TrainUnitsSystemID } from "systems/TrainUnitsSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "systems/BuildSystem.sol";

import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

import { LibSend } from "libraries/LibSend.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";

import { MOVE_SPEED } from "src/constants.sol";
import "src/prototypes.sol";
import "src/types.sol";

contract SendUnitsTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  SendUnitsSystem public sendUnitsSystem;
  TrainUnitsSystem public trainUnitsSystem;
  BuildSystem public buildSystem;

  function setUp() public override {
    super.setUp();

    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    spawn(alice);
    spawn(bob);
    spawn(deployer);
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

  function setupInvasion() internal {
    vm.roll(0);
    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(alice)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(alice));

    vm.roll(10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, DebugUnit, 10);
  }

  function testInvadeu() public {
    vm.startPrank(alice);
    setupInvasion();
    uint32 attackNumber = 10;
    vm.roll(1000);
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
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * MOVE_SPEED) / 100 / 100);
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
  }
}
