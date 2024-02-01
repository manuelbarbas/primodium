// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { console } from "forge-std/console.sol";
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";

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
    console.log("start");
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
    console.log("before attack");
    vm.startPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();
    console.log("after attack");
    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertTrue(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobHomeSpaceRock, EResource.Iron, unitCargo);
    console.log("iron to raid: %s", ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)));
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    console.log("iron after raid: %s", ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)));
    assertEq(GracePeriod.get(aliceEntity), 0, "alice should not be in grace period");
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
    console.log("end");
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

  function testFailAttackNotInOrbit() public {
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
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetId) - 1);

    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
  }

  //test fleet attack space rock and lose
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

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();

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

    /*
    P_ProductionData memory productionData = P_Production.get(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.SAM)), 1);
    for (uint256 i = 0; i < productionData.resources.length; i++) {
      if(productionData.resources[i] == uint8(EResource.U_Defense)) {
        defense = productionData.amounts[i];
        console.log("defense: %s", defense);
        assertTrue(defense > 0, "space rock should have defense");
        assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.U_Defense)) , productionData.amounts[i], "space rock defense should match SAM");    
      }
      if(productionData.resources[i] == uint8(EResource.R_HP)) {
        hpProduction = productionData.amounts[i];
        console.log("hp production: %s", hp);
        assertTrue(hpProduction > 0, "space rock should have hp production");
        assertEq(ProductionRate.get(bobHomeSpaceRock, uint8(EResource.R_HP)), productionData.amounts[i], "space rock hp production should match SAM");
      }
    }
    hp = P_ByLevelMaxResourceUpgrades.get(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.SAM)),uint8(EResource.R_HP), 1);
  */
    console.log("hp: %s, curr HP: %s", hp, ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)));
    assertEq(ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)), hp, "space rock hp should have match SAM");
    assertEq(hp, defense, "space rock hp and defense should be the same when full hp");

    vm.warp(FleetMovement.getArrivalTime(fleetId));
    console.log("before attack");
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    console.log("after attack");
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      MaxResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      "fleet should have full encryption"
    );

    uint256 unitAttack = P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    require(unitAttack > 0, "unit attack should more than 0");

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

  //test fleet attack space rock and lose
  function testFleetAttackSpaceRockWithStrongAttack() public {
    console.log("start");
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

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();

    uint256 defense = (numberOfUnits *
      P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    increaseResource(bobHomeSpaceRock, EResource.U_Defense, defense);
    increaseResource(bobHomeSpaceRock, EResource.R_HP, hp);
    increaseProduction(bobHomeSpaceRock, EResource.R_HP, hpProduction);
    console.log("space rock defense: %s ", LibSpaceRockAttributes.getDefense(bobHomeSpaceRock));
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
    console.log("before attack");
    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    console.log("after attack");
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
      "sum of un raided and raided should be initial amount"
    );
    assertEq(
      ResourceCount.get(fleetId, uint8(EResource.Copper)) +
        ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Copper)),
      copperAmount,
      "sum of un raided and raided should be initial amount"
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
    console.log("end");
  }

  //test fleet attack space rock and lose
  function testFleetAttackSpaceRockEncryption() public {
    console.log("start");
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

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    vm.startPrank(alice);
    world.sendFleet(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();

    uint256 defense = (numberOfUnits *
      P_Unit.getAttack(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    increaseResource(bobHomeSpaceRock, EResource.U_Defense, defense);
    increaseResource(bobHomeSpaceRock, EResource.R_HP, hp);
    increaseProduction(bobHomeSpaceRock, EResource.R_HP, hpProduction);
    console.log("space rock defense: %s ", LibSpaceRockAttributes.getDefense(bobHomeSpaceRock));
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
    console.log("before attack");
    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    console.log("after attack");
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
      "sum of un raided and raided should be initial amount"
    );
    assertEq(
      ResourceCount.get(fleetId, uint8(EResource.Copper)) +
        ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Copper)),
      copperAmount,
      "sum of un raided and raided should be initial amount"
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
    console.log("end");
  }
}
