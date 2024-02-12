// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetIncomingKey } from "src/Keys.sol";

/* 
  More tests to write
  - only owner
  - unit count is valid
  - resource count is valid
  - not in stance
  - fleets in same orbit
  - fleet vs fleet
  - 
*/
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

  //test fleet attack space rock and win raid
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
    world.sendFleet(fleetId, bobHomeSpaceRock);

    switchPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertTrue(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobHomeSpaceRock, EResource.Iron, unitCargo);
    assertGt(GracePeriod.get(fleetId), 0, "fleet should be in grace period");
    assertGt(GracePeriod.get(aliceHomeSpaceRock), 0, "home rock should be in grace period");

    switchPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    assertLe(GracePeriod.get(fleetId), block.timestamp, "fleet should not be in grace period");
    assertLe(GracePeriod.get(aliceHomeSpaceRock), block.timestamp, "home rock should not be in grace period");
    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)), 0, "space rock iron count should be 0");
    assertEq(ResourceCount.get(fleetId, uint8(EResource.Iron)), unitCargo, "fleet should have raided iron");
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertTrue(unitAttack > 0, "unit attack should more than 0");

    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)), 0, "space rock iron count should be 0");
  }

  function testFleetAttackSpaceRockInGracePeriod() public {
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
    world.sendFleet(fleetId, bobHomeSpaceRock);

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertGt(unitCargo, 0, "unit cargo should more than 0");
    increaseResource(bobEntity, EResource.Iron, unitCargo);

    vm.expectRevert("[Fleet] Target is in grace period");
    switchPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
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
    for (uint256 i = 0; i < resourceCounts.length; i++) {
      if (P_Transportables.getItemValue(i) == uint8(EResource.Iron)) resourceCounts[i] = 1;
    }

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.prank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.prank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);

    vm.prank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);

    //todo the same build has some prototype config issues realted to storage increase when fixed the following lines which initialize
    //buildBuilding(bob, EBuilding.SAM, getPosition1(bob));
    uint256 defense = 1000;
    uint256 hpProduction = 1;
    uint256 hp = 1000;
    increaseProduction(bobHomeSpaceRock, EResource.U_Defense, defense);
    increaseResource(bobHomeSpaceRock, EResource.R_HP, hp);
    increaseProduction(bobHomeSpaceRock, EResource.R_HP, hpProduction);

    //for testing raiding
    increaseResource(bobHomeSpaceRock, EResource.Iron, 10);

    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)), hp, "space rock hp should have match SAM");
    assertEq(hp, defense, "space rock hp and defense should be the same when full hp");

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    vm.prank(alice);
    world.attack(fleetId, bobHomeSpaceRock);

    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertGt(unitAttack, 0, "unit attack should more than 0");

    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      hp - unitAttack,
      "space rock hp should have been reduced by unit attack"
    );

    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)), 10, "space rock should not have been raided");
    assertEq(ResourceCount.get(fleetId, uint8(EResource.Iron)), 0, "fleet should have lost its resources");
    assertEq(UnitCount.get(fleetId, unitPrototype), 0, "fleet should have lost its units");

    assertEq(
      FleetMovement.getDestination(fleetId),
      aliceHomeSpaceRock,
      "fleet destination doesn't match, should have reset to home space rock"
    );
    assertEq(FleetMovement.getOrigin(fleetId), aliceHomeSpaceRock, "fleet origin doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetId), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetMovement.getSendTime(fleetId), block.timestamp, "fleet send time doesn't match");

    vm.warp(block.timestamp + 5);
    claimResources(bobHomeSpaceRock);
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      hp - unitAttack + (hpProduction * 5),
      "space rock hp should have recovered by production"
    );

    vm.warp(block.timestamp + (unitAttack / hpProduction));

    claimResources(bobHomeSpaceRock);
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      hp,
      "space rock hp should have recovered completely"
    );
  }

  function testFleetAttackSpaceRockWithStrongAttack() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;
    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.prank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.prank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);

    vm.prank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);

    uint256 defense = (numberOfUnits *
      P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    increaseResource(bobHomeSpaceRock, EResource.U_Defense, defense);
    increaseResource(bobHomeSpaceRock, EResource.R_HP, hp);
    increaseProduction(bobHomeSpaceRock, EResource.R_HP, hpProduction);
    assertEq(
      LibSpaceRockAttributes.getDefense(bobHomeSpaceRock),
      defense,
      "space rock defense should match increased defense"
    );

    uint256 ironAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    uint256 copperAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    increaseResource(bobHomeSpaceRock, EResource.Iron, ironAmount);
    increaseResource(bobHomeSpaceRock, EResource.Copper, copperAmount);
    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.prank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      0,
      "space rock hp should have been reduced by unit attack"
    );

    assertEq(
      LibFleetAttributes.getOccupiedCargo(fleetId),
      LibFleetAttributes.getCargo(fleetId),
      "fleet should have maxed out their cargo"
    );

    assertEq(
      ResourceCount.get(fleetId, uint8(EResource.Iron)) + ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)),
      ironAmount,
      "sum of unraided and raided should equal initial amount"
    );
    assertEq(
      ResourceCount.get(fleetId, uint8(EResource.Copper)) +
        ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Copper)),
      copperAmount,
      "sum of unraided and raided should equal initial amount"
    );
    assertEq(
      ResourceCount.get(fleetId, uint8(EResource.Copper)),
      ResourceCount.get(fleetId, uint8(EResource.Iron)),
      "fleet should have raided equal amounts of iron and copper"
    );

    uint256 casualtyCount = LibMath.divideRound(
      defense,
      P_Unit.getHp(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype))
    );
    if (casualtyCount > numberOfUnits) casualtyCount = numberOfUnits;

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeSpaceRock, unitPrototype)
    );
    for (uint8 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i])) {
        assertEq(
          ResourceCount.get(aliceHomeSpaceRock, requiredResources.resources[i]),
          requiredResources.amounts[i] * casualtyCount,
          "utility should have been refunded to owner soace rock when fleet took casualties"
        );
      }
    }

    assertEq(UnitCount.get(fleetId, unitPrototype), numberOfUnits - casualtyCount, "fleet should have lost units");
    assertEq(
      LibFleetAttributes.getCargo(fleetId),
      (numberOfUnits - casualtyCount) *
        P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype)),
      "fleet cargo should map units"
    );
  }

  function testAttackNotInOrbit() public {
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
    world.sendFleet(fleetId, bobHomeSpaceRock);

    switchPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);

    vm.warp(FleetMovement.getArrivalTime(fleetId) - 1);

    switchPrank(alice);
    vm.expectRevert("[Fleet] Fleet is not in orbit");
    world.attack(fleetId, bobHomeSpaceRock);
  }
}
