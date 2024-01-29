// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";

contract FleetCombatSystemTest is PrimodiumTest {
  bytes32 aliceHomeSpaceRock;
  bytes32 aliceEntity;

  bytes32 bobHomeSpaceRock;
  bytes32 bobEntity;

  bytes32 eveHomeSpaceRock;
  bytes32 eveEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeSpaceRock = spawn(alice);
    bobEntity = addressToEntity(bob);
    bobHomeSpaceRock = spawn(bob);
    eveEntity = addressToEntity(eve);
    eveHomeSpaceRock = spawn(eve);
  }

  function testFleetAttackSpaceRock() public {
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
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobEntity, block.timestamp);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    require(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobEntity, EResource.Iron, unitCargo);

    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    require(GracePeriod.get(aliceEntity) == 0, "alice should not be in grace period");
    require(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)) == 0, "space rock iron count should be 0");
    require(ResourceCount.get(fleetId, uint8(EResource.Iron)) == unitCargo, "fleet should have raided iron");
    require(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)) ==
        MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    require(unitAttack > 0, "unit attack should more than 0");

    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)), 0, "space rock iron count should be 0");
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)) - unitAttack,
      "space rock cargo count should be 0"
    );
  }

  function testFailFleetAttackSpaceRockInGracePeriod() public {
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
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    require(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobEntity, EResource.Iron, unitCargo);

    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
  }

  function testFleetAttackSpaceRockWithStrongDefense() public {
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
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(aliceEntity, block.timestamp);
    GracePeriod.set(bobEntity, block.timestamp);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    require(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)) ==
        MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    require(unitAttack > 0, "unit attack should more than 0");

    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)), 0, "space rock iron count should be 0");
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)) - unitAttack,
      "space rock cargo count should be 0"
    );
  }
}
