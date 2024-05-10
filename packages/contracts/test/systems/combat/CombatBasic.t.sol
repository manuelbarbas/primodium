// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit, EFleetStance } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { GracePeriod, P_Unit, MaxResourceCount, FleetMovement, FleetMovementData, ProductionRate, P_GameConfig, CooldownEnd, P_ColonyShipConfig, P_EnumToPrototype, ResourceCount, P_Transportables, UnitCount, ResourceCount, P_UnitPrototypes, FleetMovement, P_RequiredResources, P_RequiredResourcesData, UnitLevel, P_IsUtility } from "codegen/index.sol";

import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";

/* 
  More tests to write
  - fleets in same orbit
  - fleet vs fleet
  - 
*/
contract CombatSystemTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  bytes32 eveHomeAsteroid;
  bytes32 eveEntity;

  bytes32 fleetEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);
    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);
    eveEntity = addressToEntity(eve);
    eveHomeAsteroid = spawn(eve);
  }

  /* --------------------------------- SUCCEED -------------------------------- */
  //test fleet attack asteroid and win raid
  function testFleetAttackAsteroidu() public {
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
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    switchPrank(creator);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    assertGt(unitCargo, 0, "unit cargo should more than 0");
    increaseResource(bobHomeAsteroid, EResource.Iron, unitCargo);
    assertGt(GracePeriod.get(fleetEntity), 0, "fleet should be in grace period");
    assertGt(GracePeriod.get(aliceHomeAsteroid), 0, "home asteroid should be in grace period");

    assertEq(LibFleetStance.getAllies(fleetEntity).length, 0, "alice ally fleet");
    assertEq(LibFleetStance.getAllies(bobHomeAsteroid).length, 0, "bob ally fleet");
    switchPrank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);

    assertEq(GracePeriod.get(fleetEntity), 0, "fleet should not be in grace period");
    assertEq(GracePeriod.get(aliceHomeAsteroid), 0, "home asteroid should not be in grace period");
    assertEq(ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid iron count should be 0");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), unitCargo, "fleet should have raided iron");
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      MaxResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    assertTrue(unitAttack > 0, "unit attack should more than 0");
    assertEq(ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)), 0, "asteroid iron count should be 0");
  }

  function testFleetAttackAsteroidDefenderWins() public {
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

    vm.prank(alice);
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.prank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    vm.prank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    //todo the same build has some prototype config issues realted to storage increase when fixed the following lines which initialize
    uint256 defense = 1000 * 1e18;
    uint256 hpProductionIncrease = 1 * 1e18;
    uint256 hp = 1000 * 1e18;
    increaseProduction(bobHomeAsteroid, EResource.U_Defense, defense);
    increaseResource(bobHomeAsteroid, EResource.R_HP, hp);
    increaseProduction(bobHomeAsteroid, EResource.R_HP, hpProductionIncrease);
    uint256 hpProduction = ProductionRate.get(bobHomeAsteroid, uint8(EResource.R_HP));

    //for testing raiding
    increaseResource(bobHomeAsteroid, EResource.Iron, 10);

    assertEq(ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)), hp, "asteroid hp should have match SAM");
    assertEq(hp, defense, "asteroid hp and defense should be the same when full hp");

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));

    vm.prank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      MaxResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    assertGt(unitAttack, 0, "unit attack should more than 0");

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      hp - unitAttack,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)), 10, "asteroid should not have been raided");
    assertEq(ResourceCount.get(fleetEntity, uint8(EResource.Iron)), 0, "fleet should have lost its resources");
    assertEq(UnitCount.get(fleetEntity, unitPrototype), 0, "fleet should have lost its units");

    assertEq(
      FleetMovement.getDestination(fleetEntity),
      aliceHomeAsteroid,
      "fleet destination doesn't match, should have reset to home asteroid"
    );
    assertEq(FleetMovement.getOrigin(fleetEntity), aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(FleetMovement.getArrivalTime(fleetEntity), block.timestamp, "fleet arrival time doesn't match");
    assertEq(FleetMovement.getSendTime(fleetEntity), block.timestamp, "fleet send time doesn't match");

    vm.warp(block.timestamp + 5);
    claimResources(bobHomeAsteroid);
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      hp - unitAttack + (hpProduction * 5),
      "asteroid hp should have recovered by production"
    );

    vm.warp(block.timestamp + (unitAttack / hpProduction));

    claimResources(bobHomeAsteroid);
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      hp,
      "asteroid hp should have recovered completely"
    );
  }

  function testFleetAttackAsteroidAttackerWins() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;
    //create fleet with 10 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    uint256 housingBefore = ResourceCount.get(aliceHomeAsteroid, uint8(EResource.U_Housing));

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.prank(alice);
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.prank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    vm.prank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    uint256 defense = (numberOfUnits *
      P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    increaseResource(bobHomeAsteroid, EResource.U_Defense, defense);
    increaseResource(bobHomeAsteroid, EResource.R_HP, hp);
    increaseProduction(bobHomeAsteroid, EResource.R_HP, hpProduction);
    assertEq(
      LibCombatAttributes.getDefense(bobHomeAsteroid),
      defense,
      "asteroid defense should match increased defense"
    );

    uint256 ironAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    uint256 copperAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);
    increaseResource(bobHomeAsteroid, EResource.Copper, copperAmount);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));
    vm.prank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      0,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(
      LibCombatAttributes.getCargo(fleetEntity),
      LibCombatAttributes.getCargoCapacity(fleetEntity),
      "fleet should have maxed out their cargo"
    );

    assertEq(
      ResourceCount.get(fleetEntity, uint8(EResource.Iron)) + ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)),
      ironAmount,
      "sum of unraided and raided should equal initial amount"
    );
    assertEq(
      ResourceCount.get(fleetEntity, uint8(EResource.Copper)) +
        ResourceCount.get(bobHomeAsteroid, uint8(EResource.Copper)),
      copperAmount,
      "sum of unraided and raided should equal initial amount"
    );
    assertEq(
      ResourceCount.get(fleetEntity, uint8(EResource.Copper)),
      ResourceCount.get(fleetEntity, uint8(EResource.Iron)),
      "fleet should have raided equal amounts of iron and copper"
    );
    uint256 casualtyCount = LibMath.divideRound(
      defense,
      P_Unit.getHp(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype))
    );
    if (casualtyCount > numberOfUnits) casualtyCount = numberOfUnits;

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(
      unitPrototype,
      UnitLevel.get(aliceHomeAsteroid, unitPrototype)
    );
    for (uint8 i = 0; i < requiredResources.resources.length; i++) {
      if (P_IsUtility.get(requiredResources.resources[i])) {
        if (requiredResources.resources[i] == uint8(EResource.U_Housing)) {
          assertEq(
            ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]) - housingBefore,
            requiredResources.amounts[i] * casualtyCount,
            "utility should have been refunded housing to owner asteroid when fleet took casualties"
          );
        } else {
          assertEq(
            ResourceCount.get(aliceHomeAsteroid, requiredResources.resources[i]),
            requiredResources.amounts[i] * casualtyCount,
            "utility should have been refunded to owner asteroid when fleet took casualties"
          );
        }
      }
    }

    assertEq(UnitCount.get(fleetEntity, unitPrototype), numberOfUnits - casualtyCount, "fleet should have lost units");
    assertEq(
      LibCombatAttributes.getCargoCapacity(fleetEntity),
      (numberOfUnits - casualtyCount) * P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype)),
      "fleet cargo should map units"
    );
  }

  // alice (attacker) has 2 minuteman marines, bob (defender) has 1 minuteman marine
  function testtrainingTimeFleetAttackFleetAttackerWins() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // create and send alice fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 aliceFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);

    switchPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    // create bob fleet
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);
    switchPrank(bob);
    bytes32 bobFleetEntity = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(aliceFleetEntity), GracePeriod.get(bobFleetEntity)));

    assertGt(GracePeriod.get(aliceFleetEntity), 0, "alice fleet should be in grace period");
    assertGt(GracePeriod.get(aliceHomeAsteroid), 0, "alice home asteroid should be in grace period");
    assertGt(GracePeriod.get(bobHomeAsteroid), 0, "bob home asteroid should be in grace period");
    assertGt(GracePeriod.get(bobFleetEntity), 0, "bob fleet should be in grace period");

    switchPrank(alice);
    world.Primodium__attack(aliceFleetEntity, bobFleetEntity);

    assertEq(GracePeriod.get(aliceFleetEntity), 0, "alice fleet should not be in grace period");
    assertEq(GracePeriod.get(aliceHomeAsteroid), 0, "alice home asteroid should not be in grace period");
    assertGt(GracePeriod.get(bobHomeAsteroid), 0, "bob home asteroid should be in grace period");
    assertGt(GracePeriod.get(bobFleetEntity), 0, "bob fleet should be in grace period");

    uint256 bobRemainingUnits = UnitCount.get(bobFleetEntity, minutemanEntity);
    assertEq(bobRemainingUnits, 0, "bob units should have been reduced");
  }

  function testFleetAttackCooldown() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 100;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // create and send alice fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 aliceFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);

    switchPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    // create bob fleet
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);
    switchPrank(bob);
    bytes32 bobFleetEntity = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(aliceFleetEntity), GracePeriod.get(bobFleetEntity)));

    uint256 aliceAttack = LibCombatAttributes.getAttack(aliceFleetEntity);

    switchPrank(alice);
    world.Primodium__attack(aliceFleetEntity, bobHomeAsteroid);

    uint256 cooldown = LibCombat.getCooldownTime(aliceAttack, false);
    switchPrank(creator);
    P_GameConfig.setWorldSpeed(P_GameConfig.getWorldSpeed() / 10);
    uint256 slowCooldown = LibCombat.getCooldownTime(aliceAttack, false);
    assertEq(cooldown * 10, slowCooldown);
    assertEq(CooldownEnd.get(aliceFleetEntity), block.timestamp + cooldown);
    assertGt(CooldownEnd.get(aliceFleetEntity), block.timestamp);
  }

  function testFleetAttackFailedInCooldown() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 100;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // create and send alice fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 aliceFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);

    switchPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    // create bob fleet
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);
    switchPrank(bob);
    bytes32 bobFleetEntity = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(aliceFleetEntity), GracePeriod.get(bobFleetEntity)));

    switchPrank(creator);
    CooldownEnd.set(aliceFleetEntity, block.timestamp + 1);
    switchPrank(alice);

    vm.expectRevert("[Fleet] Fleet is in cooldown");
    world.Primodium__attack(aliceFleetEntity, bobHomeAsteroid);
  }

  function testCooldownTimes() public {
    uint256 testValue = 1 * 1e18;
    assertEq(LibCombat.getCooldownTime(testValue, false), 0);

    testValue = 1000 * 1e18;
    assertEq(LibCombat.getCooldownTime(testValue, false), 2 * 60);

    testValue = 10000 * 1e18;
    assertEq(LibCombat.getCooldownTime(testValue, false), 24 * 60);

    testValue = 20000 * 1e18;
    assertEq(LibCombat.getCooldownTime(testValue, false), 48 * 60);

    testValue = 100000 * 1e18;
    assertApproxEqAbs(LibCombat.getCooldownTime(testValue, false), 103 * 60, 3);

    testValue = 150000 * 1e18;
    assertApproxEqAbs(LibCombat.getCooldownTime(testValue, false), 118 * 60, 3);

    testValue = 250000 * 1e18;
    assertApproxEqAbs(LibCombat.getCooldownTime(testValue, false), 137 * 60, 3);

    uint256 extension = P_ColonyShipConfig.getCooldownExtension();

    assertEq(
      LibCombat.getCooldownTime(testValue, false) + (extension * 60),
      LibCombat.getCooldownTime(testValue, true)
    );
  }

  function testFleetAttackBlockingFleetAttackerWins() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // create and send alice fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 aliceFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);

    switchPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    // create bob fleet
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);
    switchPrank(bob);
    bytes32 bobFleetEntity = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(aliceFleetEntity), GracePeriod.get(bobFleetEntity)));

    switchPrank(alice);
    world.Primodium__attack(aliceFleetEntity, bobFleetEntity);

    FleetMovementData memory fleetMovement = FleetMovement.get(bobFleetEntity);

    assertEq(fleetMovement.destination, bobHomeAsteroid, "fleet destination doesn't match");
    assertEq(fleetMovement.origin, bobHomeAsteroid, "fleet origin doesn't match");
    assertEq(fleetMovement.arrivalTime, block.timestamp, "fleet arrival time doesn't match");

    uint256 bobRemainingUnits = UnitCount.get(bobFleetEntity, minutemanEntity);
    assertEq(bobRemainingUnits, 0, "bob units should have been reduced");
  }

  function testFleetAttackFleetDefenderKillsAttacker() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    //create fleet with 1 minuteman marine
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }

    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // create and send alice fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(alice);
    bytes32 aliceFleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(aliceFleetEntity, bobHomeAsteroid);

    // create bob fleet
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1000;
    }
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);
    switchPrank(bob);
    bytes32 bobFleetEntity = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    switchPrank(creator);

    GracePeriod.set(bobFleetEntity, block.timestamp - 1);

    switchPrank(alice);
    console.log("timestamp %s, grace period, %s", block.timestamp, GracePeriod.get(bobFleetEntity));
    console.log(
      "alice arrival %s, bobArrival, %s",
      FleetMovement.getArrivalTime(aliceFleetEntity),
      FleetMovement.getArrivalTime(bobFleetEntity)
    );

    vm.warp(
      LibMath.max(
        LibMath.max(FleetMovement.getArrivalTime(bobFleetEntity), FleetMovement.getArrivalTime(aliceFleetEntity)),
        GracePeriod.get(bobHomeAsteroid)
      )
    );

    world.Primodium__attack(aliceFleetEntity, bobFleetEntity);

    FleetMovementData memory fleetMovement = FleetMovement.get(aliceFleetEntity);

    assertEq(fleetMovement.destination, aliceHomeAsteroid, "fleet destination doesn't match");
    assertEq(fleetMovement.origin, aliceHomeAsteroid, "fleet origin doesn't match");
    assertEq(fleetMovement.arrivalTime, block.timestamp, "fleet arrival time doesn't match");

    uint256 aliceRemainingUnits = UnitCount.get(aliceFleetEntity, minutemanEntity);
    assertEq(aliceRemainingUnits, 0, "alice units should have been reduced");

    uint256 bobRemainingUnits = UnitCount.get(bobFleetEntity, minutemanEntity);
    assertGt(bobRemainingUnits, 0, "bob units should not be 0");
  }

  /* ------------------------------ FAILURE CASES ----------------------------- */
  function testAttackWrongOwner() public {
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
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    switchPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    assertTrue(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobHomeAsteroid, EResource.Iron, unitCargo);
    assertGt(GracePeriod.get(fleetEntity), 0, "fleet should be in grace period");
    assertGt(GracePeriod.get(aliceHomeAsteroid), 0, "home asteroid should be in grace period");

    switchPrank(bob);
    vm.expectRevert("[Fleet] Not fleet owner");
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();
  }

  function testFleetAttackAsteroidInGracePeriod() public {
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
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    vm.warp(GracePeriod.get(bobHomeAsteroid) - 1);

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeAsteroid, unitPrototype));
    assertGt(unitCargo, 0, "unit cargo should more than 0");
    increaseResource(bobEntity, EResource.Iron, unitCargo);

    vm.expectRevert("[Fleet] Target is in grace period");
    switchPrank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
  }

  function testFleetAttackInStance() public {
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
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);

    switchPrank(creator);

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));

    switchPrank(alice);
    world.Primodium__setFleetStance(fleetEntity, uint8(EFleetStance.Defend), bobHomeAsteroid);
    vm.expectRevert("[Fleet] Fleet cannot be in stance");
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);

    world.Primodium__setFleetStance(fleetEntity, uint8(EFleetStance.Block), bobHomeAsteroid);

    vm.expectRevert("[Fleet] Fleet cannot be in stance");
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
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
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntity), GracePeriod.get(bobHomeAsteroid)));

    switchPrank(alice);
    vm.expectRevert("[Fleet] Fleet is not in orbit");
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
  }
}
