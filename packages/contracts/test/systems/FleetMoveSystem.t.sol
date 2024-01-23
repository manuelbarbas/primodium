// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";

contract FleetMoveSystemTest is PrimodiumTest {
  bytes32 aliceHomeSpaceRock;
  bytes32 aliceEntity;

  bytes32 bobHomeSpaceRock;
  bytes32 bobEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeSpaceRock = spawn(alice);
    bobEntity = addressToEntity(bob);
    bobHomeSpaceRock = spawn(bob);
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
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    uint256 speed = P_Unit.getSpeed(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    uint256 arrivalTime = LibFleetMove.getArrivalTime(aliceHomeSpaceRock, Position.get(bobHomeSpaceRock), speed);

    uint256 correctArrivalTime = block.timestamp +
      ((LibMath.distance(Position.get(aliceHomeSpaceRock), Position.get(bobHomeSpaceRock)) *
        P_GameConfig.getTravelTime() *
        WORLD_SPEED_SCALE *
        UNIT_SPEED_SCALE) / (P_GameConfig.getWorldSpeed() * speed));

    require(arrivalTime == correctArrivalTime, "arrival time doesn't match");
    world.sendFleet(fleetId, bobHomeSpaceRock);
    assertEq(FleetMovement.getDestination(fleetId), bobHomeSpaceRock, "fleet destination doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetId), block.timestamp + 1, "fleet arrival time doesn't match");
    assertEq(FleetMovement.getOrigin(fleetId), aliceHomeSpaceRock, "fleet origin doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetId), correctArrivalTime, "fleet arrival time doesn't match");
    assertEq(FleetMovement.getSendTime(fleetId), block.timestamp, "fleet send time doesn't match");
  }
}
