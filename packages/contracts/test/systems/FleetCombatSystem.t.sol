// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { console } from "forge-std/console.sol";
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetIncomingKey } from "src/Keys.sol";

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

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    uint256 unitCargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    assertTrue(unitCargo > 0, "unit cargo should more than 0");
    increaseResource(bobHomeSpaceRock, EResource.Iron, unitCargo);
    console.log("iron to raid: %s", ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)));
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();
    console.log("after attack");
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
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 decryption = P_Unit.getDecryption(
      colonyShipPrototype,
      UnitLevel.get(aliceHomeSpaceRock, colonyShipPrototype)
    );
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 2;
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
    uint256 encryption = ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption));
    increaseResource(bobHomeSpaceRock, EResource.U_Defense, defense);
    increaseResource(bobHomeSpaceRock, EResource.R_HP, hp);
    increaseProduction(bobHomeSpaceRock, EResource.R_HP, hpProduction);

    uint256 ironAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    increaseResource(bobHomeSpaceRock, EResource.Iron, ironAmount);

    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.startPrank(alice);
    world.attack(fleetId, bobHomeSpaceRock);
    vm.stopPrank();

    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_HP)),
      0,
      "space rock hp should have been reduced by unit attack"
    );

    assertEq(LibFleetAttributes.getOccupiedCargo(fleetId), 0, "fleet should not have raided");

    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)),
      ironAmount,
      "space rock should not have been raided"
    );

    console.log("curr encryption: %s", ResourceCount.get(fleetId, uint8(EResource.R_Encryption)));
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      encryption - decryption,
      "encryption should have been reduced by decryption"
    );

    vm.warp(block.timestamp + 5);
    claimResources(bobHomeSpaceRock);
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      encryption - decryption + ProductionRate.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)) * 5,
      "encryption should recovered by production"
    );

    console.log("end");
  }

  //test fleet attack space rock and lose
  function testFleetAttackSpaceRockEncryptionTakeOver() public {
    console.log("start");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 decryption = P_Unit.getDecryption(
      colonyShipPrototype,
      UnitLevel.get(aliceHomeSpaceRock, colonyShipPrototype)
    );
    console.log("decryption: %s", decryption);
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 1;
    }
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    uint256 encryption = ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption));
    console.log("encryption: %s", encryption);
    uint256 fleetCountToWin = LibMath.divideCeil(encryption, decryption);

    bytes32[] memory fleetIds = new bytes32[](fleetCountToWin);
    require(fleetCountToWin > 0, "should have at least 1 fleet to win");

    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("create fleet %s", i);
      setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

      vm.startPrank(alice);
      fleetIds[i] = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
      vm.stopPrank();
      console.log("create fleet done %s", i);
    }

    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("send fleet %s", i);
      world.sendFleet(fleetIds[i], bobHomeSpaceRock);
      console.log("send fleet done %s", i);
    }
    vm.stopPrank();
    //bob stuff:

    uint256 ironAmount = numberOfUnits *
      P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));
    increaseResource(bobHomeSpaceRock, EResource.Iron, ironAmount);

    vm.startPrank(creator);
    GracePeriod.set(bobHomeSpaceRock, block.timestamp);
    vm.stopPrank();

    console.log("creaete bob fleet");
    setupCreateFleet(bob, bobHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(bob);
    bytes32 bobFleet = world.createFleet(bobHomeSpaceRock, unitCounts, resourceCounts);

    world.sendFleet(bobFleet, aliceHomeSpaceRock);
    vm.stopPrank();
    console.log("creaete bob fleet done");

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetIds[0]), block.timestamp));
    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("fleet attack %s", i);
      uint256 encryptionBeforeAttack = ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption));

      world.attack(fleetIds[i], bobHomeSpaceRock);
      if (encryptionBeforeAttack > decryption) {
        assertEq(
          ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
          encryptionBeforeAttack - decryption,
          "encryption should have decreased after attack"
        );
      } else {
        assertEq(
          ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
          0,
          "encryption should have reached zero"
        );
      }
      assertEq(LibFleetAttributes.getOccupiedCargo(fleetIds[i]), 0, "fleet should not have raided");
      console.log("fleet attack done %s", i);
    }

    vm.stopPrank();
    console.log("encryption after battles: %s", ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)));

    assertEq(OwnedBy.get(bobHomeSpaceRock), aliceEntity, "space rock should have been taken over");

    assertEq(UnitCount.get(bobFleet, unitPrototype), 0, "fleet should have been disbanded and marine units");
    assertEq(
      UnitCount.get(bobFleet, colonyShipPrototype),
      0,
      "fleet should have been disbanded and colony ship unit lost"
    );

    assertEq(FleetMovement.getDestination(bobFleet), bobHomeSpaceRock, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getOrigin(bobFleet), bobHomeSpaceRock, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getArrivalTime(bobFleet), block.timestamp, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getSendTime(bobFleet), block.timestamp, "fleet should have been reset to orbit");

    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.Iron)),
      ironAmount,
      "space rock should not have been raided"
    );
    assertEq(
      ResourceCount.get(bobHomeSpaceRock, uint8(EResource.R_Encryption)),
      0,
      "encryption should have reached zero"
    );
    console.log("end");
  }

  function testAttackPirateAsteroid() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 cargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    console.log("before setup create fleet");
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);
    console.log("setup create fleet");

    vm.prank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);

    console.log("created fleet");
    // setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);
    // vm.prank(alice);
    // bytes32 secondFleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);

    // P_SpawnPirateAsteroidData memory spawnPirateAsteroid = P_SpawnPirateAsteroidData({
    //   x: 5;
    //   y: 5;
    //   resources: new uint8[](1);
    //   resourceAmounts: new uint256[](1);
    //   units: new bytes32[](1);
    //   unitAmounts: new uint256[](1);
    // });

    // spawnPirateAsteroid.resources[0] = uint8(EResource.Iron);
    // spawnPirateAsteroid.resourceAmounts[0] =
    //   cargo *
    //   numberOfUnits +
    //   (P_Unit.getCargo(colonyShipPrototype, UnitLevel.get(aliceHomeSpaceRock, colonyShipPrototype)) * 2);
    // spawnPirateAsteroid.units[0] = unitPrototype;
    // spawnPirateAsteroid.unitAmounts[0] = 5;

    // vm.startPrank(creator);
    // bytes32 objectivePrototype = bytes32("someObjective");
    // P_SpawnPirateAsteroid.set(objectivePrototype, spawnPirateAsteroid);

    // bytes32 pirateAsteroid = world.spawnPirateAsteroid(aliceEntity, objectivePrototype);
    // console.log("spawned pirate asteroid");
    // vm.stopPrank();

    // assertEq(PirateAsteroid.getIsPirateAsteroid(pirateAsteroid), true, "pirate asteroid should have been created");
    // assertEq(PirateAsteroid.getIsDefeated(pirateAsteroid), false, "pirate asteroid should not have been defeated");
    // assertEq(
    //   PirateAsteroid.getPlayerEntity(pirateAsteroid),
    //   aliceEntity,
    //   "pirate asteroid should be personal to alice"
    // );
    // assertEq(
    //   PirateAsteroid.getPrototype(pirateAsteroid),
    //   objectivePrototype,
    //   "pirate asteroid should be associated with spawning objective"
    // );

    // vm.startPrank(alice);

    // world.sendFleet(fleetId, bobHomeSpaceRock);
    // vm.warp(FleetMovement.getArrivalTime(fleetId));
    // console.log("sent fleet to bob");

    // world.sendFleet(fleetId, pirateAsteroid);
    // vm.warp(FleetMovement.getArrivalTime(fleetId));
    // console.log("sent fleet from bob to pirate asteroid");

    // world.sendFleet(secondFleetId, pirateAsteroid);
    // uint256 halfWayAmount = (FleetMovement.getArrivalTime(secondFleetId) - FleetMovement.getSendTime(secondFleetId)) /
    //   2;
    // vm.warp(block.timestamp + halfWayAmount);
    // assertEq(block.timestamp, FleetMovement.getSendTime(secondFleetId) + halfWayAmount, "time passed should match");
    // console.log("sent second fleet from alice to pirate asteroid: $s", halfWayAmount);

    // vm.stopPrank();

    // vm.startPrank(alice);
    // world.attack(fleetId, pirateAsteroid);
    // vm.stopPrank();
    // console.log("attack pirate asteroid");

    // assertEq(
    //   LibFleetAttributes.getOccupiedCargo(fleetId),
    //   LibFleetAttributes.getCargo(fleetId),
    //   "fleet should have raided max cargo"
    // );

    // assertEq(
    //   LibFleetAttributes.getCargo(fleetId) + ResourceCount.get(pirateAsteroid, uint8(EResource.Iron)),
    //   spawnPirateAsteroid.resourceAmounts[0],
    //   "sum of un raided and raided should be initial amount"
    // );

    // assertEq(
    //   FleetMovement.getDestination(secondFleetId),
    //   aliceHomeSpaceRock,
    //   "fleet should be moving back to home space rock through recall"
    // );
    // assertEq(
    //   FleetMovement.getOrigin(secondFleetId),
    //   pirateAsteroid,
    //   "fleet should be moving back from pirate asteroid through recall"
    // );
    // //todo don't understand why this is failing will test with client
    // assertEq(
    //   FleetMovement.getArrivalTime(secondFleetId),
    //   block.timestamp + halfWayAmount,
    //   "fleet should take same amount to get back that has moved up to that point"
    // );

    // assertEq(
    //   FleetMovement.getDestination(fleetId),
    //   aliceHomeSpaceRock,
    //   "fleet should be moving back to home space rock"
    // );
    // assertEq(FleetMovement.getOrigin(fleetId), pirateAsteroid, "fleet should be moving back from pirate asteroid");
    // assertTrue(FleetMovement.getArrivalTime(fleetId) > block.timestamp, "fleet should take time to go back");

    // assertEq(PirateAsteroid.getIsDefeated(pirateAsteroid), true, "pirate asteroid should have been defeated");
    // assertEq(
    //   FleetsMap.size(pirateAsteroid, FleetIncomingKey),
    //   0,
    //   "pirate asteroid should not have any incoming fleets"
    // );
    // assertTrue(
    //   DefeatedPirate.get(aliceEntity, objectivePrototype),
    //   "pirate asteroid should be marked as defeated for alice"
    // );
  }

  function testFailAttackPirateAsteroidAfterDefeated() public {
    console.log("start");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 cargo = P_Unit.getCargo(unitPrototype, UnitLevel.get(aliceHomeSpaceRock, unitPrototype));

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == unitPrototype) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeSpaceRock, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.createFleet(aliceHomeSpaceRock, unitCounts, resourceCounts);
    vm.stopPrank();

    P_SpawnPirateAsteroidData memory spawnPirateAsteroid;

    spawnPirateAsteroid.x = 5;
    spawnPirateAsteroid.y = 5;
    spawnPirateAsteroid.resources = new uint8[](1);
    spawnPirateAsteroid.resources[0] = uint8(EResource.Iron);
    spawnPirateAsteroid.resourceAmounts = new uint256[](1);
    spawnPirateAsteroid.resourceAmounts[0] =
      cargo *
      numberOfUnits +
      (P_Unit.getCargo(colonyShipPrototype, UnitLevel.get(aliceHomeSpaceRock, colonyShipPrototype)) * 2);
    spawnPirateAsteroid.units = new bytes32[](1);
    spawnPirateAsteroid.units[0] = unitPrototype;
    spawnPirateAsteroid.unitAmounts = new uint256[](1);
    spawnPirateAsteroid.unitAmounts[0] = 5;

    vm.startPrank(creator);
    bytes32 objectivePrototype = bytes32("someObjective");
    P_SpawnPirateAsteroid.set(objectivePrototype, spawnPirateAsteroid);
    bytes32 pirateAsteroid = world.spawnPirateAsteroid(aliceEntity, objectivePrototype);
    vm.stopPrank();

    vm.startPrank(alice);

    world.sendFleet(fleetId, pirateAsteroid);
    vm.warp(FleetMovement.getArrivalTime(fleetId));

    vm.stopPrank();

    vm.startPrank(alice);
    world.attack(fleetId, pirateAsteroid);
    vm.stopPrank();

    vm.warp(FleetMovement.getArrivalTime(fleetId));

    vm.startPrank(alice);
    world.sendFleet(fleetId, pirateAsteroid);
    vm.stopPrank();
  }
}
