// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { MaxColonySlots, LastConquered, OwnedBy, UnitCount, ProductionRate, CooldownEnd, P_ColonyShipConfig, GracePeriod, P_Unit, FleetMovement, P_EnumToPrototype, ResourceCount, P_Transportables, ResourceCount, P_UnitPrototypes, FleetMovement, IsFleet, UnitLevel, Home } from "codegen/index.sol";

import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { LibCombat } from "libraries/LibCombat.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibColony } from "libraries/LibColony.sol";

contract CombatEncryptionTest is PrimodiumTest {
  bytes32 aliceHomeAsteroid;
  bytes32 aliceEntity;

  bytes32 bobHomeAsteroid;
  bytes32 bobEntity;

  bytes32 eveHomeAsteroid;
  bytes32 eveEntity;

  function setUp() public override {
    super.setUp();
    aliceEntity = addressToEntity(alice);
    aliceHomeAsteroid = spawn(alice);
    bobEntity = addressToEntity(bob);
    bobHomeAsteroid = spawn(bob);
    eveEntity = addressToEntity(eve);
    eveHomeAsteroid = spawn(eve);
  }

  function testFleetAttackAsteroidEncryption() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 50;

    //create fleet with 1 minuteman marine
    bytes32 minuteman = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 decryption = P_ColonyShipConfig.getDecryption();

    vm.startPrank(creator);
    // Add 2 colony slots to account for the 2 colony ships about to be created
    LibColony.increaseMaxColonySlots(aliceEntity);
    LibColony.increaseMaxColonySlots(aliceEntity);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    upgradeMainBase(bob);
    upgradeMainBase(bob);
    upgradeMainBase(bob);

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);
    vm.stopPrank();

    uint256 defense = (numberOfUnits * P_Unit.getAttack(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    uint256 encryption = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));
    assertGt(encryption, decryption, "bob should have enough encryption to defend");
    uint256 attack = LibCombatAttributes.getAttack(fleetEntity);
    increaseResource(bobHomeAsteroid, EResource.U_Defense, defense);
    increaseResource(bobHomeAsteroid, EResource.R_HP, hp);
    increaseProduction(bobHomeAsteroid, EResource.R_HP, hpProduction);

    uint256 ironAmount = numberOfUnits * P_Unit.getCargo(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);

    vm.warp(FleetMovement.getArrivalTime(fleetEntity));
    vm.startPrank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    assertEq(
      CooldownEnd.get(fleetEntity),
      block.timestamp + LibCombat.getCooldownTime(attack, true),
      "encryption incorrect"
    );
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      0,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(LibCombatAttributes.getCargo(fleetEntity), 0, "fleet should not have raided");

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)),
      ironAmount,
      "asteroid should not have been raided"
    );

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      encryption - decryption,
      "encryption should have been reduced by decryption"
    );

    vm.warp(block.timestamp + 5);
    claimResources(bobHomeAsteroid);
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      encryption - decryption + ProductionRate.get(bobHomeAsteroid, uint8(EResource.R_Encryption)) * 5,
      "encryption should recovered by production"
    );
  }

  function testFleetAttackAsteroidEncryptionTakeOver() public {
    console.log("start");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 minuteman = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 decryption = P_ColonyShipConfig.getDecryption();

    console.log("decryption: %s", decryption);
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 1;
    }
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    uint256 encryption = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));
    console.log("encryption: %s", encryption);
    uint256 fleetCountToWin = LibMath.divideCeil(encryption, decryption);

    bytes32[] memory fleetEntities = new bytes32[](fleetCountToWin);
    require(fleetCountToWin > 0, "should have at least 1 fleet to win");

    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("create fleet %s", i);

      // Add 1 colony slot to account for the colony ship about to be created
      vm.startPrank(creator);
      LibColony.increaseMaxColonySlots(aliceEntity);
      vm.stopPrank();

      setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

      vm.startPrank(alice);
      fleetEntities[i] = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
      vm.stopPrank();
      console.log("create fleet done %s", i);
    }

    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("send fleet %s", i);
      world.Primodium__sendFleet(fleetEntities[i], bobHomeAsteroid);
      console.log("send fleet done %s", i);
    }
    vm.stopPrank();
    //bob stuff:

    uint256 ironAmount = numberOfUnits * P_Unit.getCargo(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);

    vm.startPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);
    // Add 1 colony slot to account for the colony ship about to be created
    LibColony.increaseMaxColonySlots(bobEntity);
    vm.stopPrank();

    console.log("create bob fleet");
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(bob);
    bytes32 bobFleet = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    world.Primodium__sendFleet(bobFleet, aliceHomeAsteroid);
    vm.stopPrank();
    console.log("create bob fleet done");

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetEntities[0]), block.timestamp));

    uint256 aliceSlotsOccupied = LibColony.getColonyShipsPlusAsteroids(aliceEntity);
    uint256 bobSlotsOccupied;
    console.log("Alice MaxColonySlots: ", MaxColonySlots.get(aliceEntity));
    console.log("Alice Occupied Slots: ", aliceSlotsOccupied);

    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("fleet attack %s", i);
      uint256 encryptionBeforeAttack = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));

      // For testing destruction of colony ship on a transferred asteroid
      if (i == fleetCountToWin - 1) {
        vm.startPrank(creator);
        // Add 1 Colony Slot for Colony Ship on the Bob's Asteroid, and 1 Colony Slot for one starting training
        LibColony.increaseMaxColonySlots(bobEntity);
        LibColony.increaseMaxColonySlots(bobEntity);
        UnitCount.set(bobHomeAsteroid, colonyShipPrototype, 1);
        trainUnits(bob, colonyShipPrototype, 1, false); // still in training
        bobSlotsOccupied = LibColony.getColonyShipsPlusAsteroids(bobEntity);
        console.log("Bob MaxColonySlots: ", MaxColonySlots.get(bobEntity));
        console.log("Bob Occupied Slots: ", bobSlotsOccupied);
        vm.stopPrank();
        vm.startPrank(alice);
      }

      world.Primodium__attack(fleetEntities[i], bobHomeAsteroid);
      if (encryptionBeforeAttack > decryption) {
        assertEq(
          ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
          encryptionBeforeAttack - decryption,
          "encryption should have decreased after attack"
        );
      } else {
        assertEq(
          ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
          0,
          "encryption should have reached zero"
        );
      }
      assertEq(LibCombatAttributes.getCargo(fleetEntities[i]), 0, "fleet should not have raided");
      console.log("fleet attack done %s", i);
    }

    vm.stopPrank();
    assertEq(LastConquered.get(bobHomeAsteroid), block.timestamp, "last conquered should have been updated");
    console.log("encryption after battles: %s", ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)));

    assertEq(OwnedBy.get(bobHomeAsteroid), aliceEntity, "asteroid should have been taken over");
    assertEq(
      LibColony.getColonyShipsPlusAsteroids(aliceEntity),
      aliceSlotsOccupied,
      "alice should have same slots occupied because her colony ship turned into a colony, and she shouldn't get Bob's colony ships"
    );
    assertEq(
      LibColony.getColonyShipsPlusAsteroids(bobEntity),
      bobSlotsOccupied - 4,
      "bob should have 4 fewer slots occupied. Lost: asteroid, training colony ship, colony ship on asteroid, colony ship in fleet"
    );

    assertEq(UnitCount.get(bobFleet, minuteman), 0, "fleet should have been cleared and marine units");
    assertEq(
      UnitCount.get(bobFleet, colonyShipPrototype),
      0,
      "fleet should have been cleared and colony ship unit lost"
    );

    assertEq(FleetMovement.getDestination(bobFleet), bytes32(0), "fleet should have been destroyed/abandoned");
    assertEq(FleetMovement.getOrigin(bobFleet), bytes32(0), "fleet should have been destroyed/abandoned");
    assertEq(FleetMovement.getArrivalTime(bobFleet), 0, "fleet should have been destroyed/abandoned");
    assertEq(FleetMovement.getSendTime(bobFleet), 0, "fleet should have been destroyed/abandoned");
    assertEq(IsFleet.get(bobFleet), false, "fleet should have been destroyed/abandoned");

    assertEq(Home.get(bobEntity), bytes32(0), "bob should have lost his home asteroid");

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)),
      ironAmount,
      "asteroid should not have been raided"
    );
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      0,
      "encryption should have reached zero"
    );
    console.log("end");
  }

  function testFleetAttackMultipleColonyShips() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 minuteman = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));
    uint256 decryption = P_ColonyShipConfig.getDecryption();

    vm.startPrank(creator);
    // Add 4 colony slots to account for the colony ships about to be created
    LibColony.increaseMaxColonySlots(aliceEntity);
    LibColony.increaseMaxColonySlots(aliceEntity);
    LibColony.increaseMaxColonySlots(aliceEntity);
    LibColony.increaseMaxColonySlots(aliceEntity);
    vm.stopPrank();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetEntity = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    console.log("number of colony ships:", UnitCount.get(fleetEntity, colonyShipPrototype));
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);
    vm.stopPrank();

    upgradeMainBase(bob);
    upgradeMainBase(bob);
    upgradeMainBase(bob);

    uint256 defense = (numberOfUnits * P_Unit.getAttack(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    uint256 encryption = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));
    assertGt(encryption, decryption, "bob should have enough encryption to defend");
    increaseResource(bobHomeAsteroid, EResource.U_Defense, defense);
    increaseResource(bobHomeAsteroid, EResource.R_HP, hp);
    increaseProduction(bobHomeAsteroid, EResource.R_HP, hpProduction);

    uint256 ironAmount = numberOfUnits * P_Unit.getCargo(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);

    console.log("asteroid hp before attack: %s", ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)));
    console.log(
      "asteroid encryption before attack: %s",
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption))
    );

    vm.warp(FleetMovement.getArrivalTime(fleetEntity));
    vm.startPrank(alice);
    world.Primodium__attack(fleetEntity, bobHomeAsteroid);
    vm.stopPrank();

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      0,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(LibCombatAttributes.getCargo(fleetEntity), 0, "fleet should not have raided");

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)),
      ironAmount,
      "asteroid should not have been raided"
    );

    console.log(
      "encryption: %s decryption: %s",
      ResourceCount.get(fleetEntity, uint8(EResource.R_Encryption)),
      decryption
    );
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      encryption - decryption,
      "encryption should have been reduced by decryption"
    );

    vm.warp(block.timestamp + 5);
    claimResources(bobHomeAsteroid);
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)),
      encryption - decryption + ProductionRate.get(bobHomeAsteroid, uint8(EResource.R_Encryption)) * 5,
      "encryption should recovered by production"
    );

    console.log("end");
  }
}
