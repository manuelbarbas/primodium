// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console } from "forge-std/console.sol";
import "test/PrimodiumTest.t.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetIncomingKey } from "src/Keys.sol";

contract FleetCombatSystemTest is PrimodiumTest {
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
    bytes32 capitalShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip));
    uint256 decryption = P_CapitalShipConfig.getDecryption();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == capitalShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    vm.stopPrank();

    upgradeMainBase(bob);
    upgradeMainBase(bob);
    upgradeMainBase(bob);

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetId, bobHomeAsteroid);
    vm.stopPrank();

    vm.startPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);
    vm.stopPrank();

    uint256 defense = (numberOfUnits * P_Unit.getAttack(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman))) / 2;
    uint256 hpProduction = 1;
    uint256 hp = defense;
    uint256 encryption = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));
    assertGt(encryption, decryption, "bob should have enough encryption to defend");
    uint256 attack = LibCombatAttributes.getAttack(fleetId);
    increaseResource(bobHomeAsteroid, EResource.U_Defense, defense);
    increaseResource(bobHomeAsteroid, EResource.R_HP, hp);
    increaseProduction(bobHomeAsteroid, EResource.R_HP, hpProduction);

    uint256 ironAmount = numberOfUnits * P_Unit.getCargo(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);

    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.startPrank(alice);
    world.Primodium__attack(fleetId, bobHomeAsteroid);
    vm.stopPrank();

    assertEq(
      CooldownEnd.get(fleetId),
      block.timestamp + LibFleetCombat.getCooldownTime(attack, true),
      "encryption incorrect"
    );
    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      0,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(LibCombatAttributes.getCargo(fleetId), 0, "fleet should not have raided");

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
    bytes32 capitalShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip));
    uint256 decryption = P_CapitalShipConfig.getDecryption();

    console.log("decryption: %s", decryption);
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == capitalShipPrototype) unitCounts[i] = 1;
    }
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    uint256 encryption = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));
    console.log("encryption: %s", encryption);
    uint256 fleetCountToWin = LibMath.divideCeil(encryption, decryption);

    bytes32[] memory fleetIds = new bytes32[](fleetCountToWin);
    require(fleetCountToWin > 0, "should have at least 1 fleet to win");

    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("create fleet %s", i);
      setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

      vm.startPrank(alice);
      fleetIds[i] = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
      vm.stopPrank();
      console.log("create fleet done %s", i);
    }

    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("send fleet %s", i);
      world.Primodium__sendFleet(fleetIds[i], bobHomeAsteroid);
      console.log("send fleet done %s", i);
    }
    vm.stopPrank();
    //bob stuff:

    uint256 ironAmount = numberOfUnits * P_Unit.getCargo(minuteman, UnitLevel.get(aliceHomeAsteroid, minuteman));
    increaseResource(bobHomeAsteroid, EResource.Iron, ironAmount);

    vm.startPrank(creator);
    GracePeriod.set(bobHomeAsteroid, block.timestamp);
    vm.stopPrank();

    console.log("creaete bob fleet");
    setupCreateFleet(bob, bobHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(bob);
    bytes32 bobFleet = world.Primodium__createFleet(bobHomeAsteroid, unitCounts, resourceCounts);

    world.Primodium__sendFleet(bobFleet, aliceHomeAsteroid);
    vm.stopPrank();
    console.log("creaete bob fleet done");

    vm.warp(LibMath.max(FleetMovement.getArrivalTime(fleetIds[0]), block.timestamp));

    uint256 bobHomeScore = Score.get(bobHomeAsteroid);
    uint256 bobPlayerScore = Score.get(bobEntity);
    uint256 aliceScore = Score.get(aliceEntity);

    vm.startPrank(alice);
    for (uint256 i = 0; i < fleetCountToWin; i++) {
      console.log("fleet attack %s", i);
      uint256 encryptionBeforeAttack = ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption));

      world.Primodium__attack(fleetIds[i], bobHomeAsteroid);
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
      assertEq(LibCombatAttributes.getCargo(fleetIds[i]), 0, "fleet should not have raided");
      console.log("fleet attack done %s", i);
    }

    vm.stopPrank();
    console.log("encryption after battles: %s", ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_Encryption)));
    assertEq(Score.get(aliceEntity), aliceScore + bobHomeScore, "alice should have gained bob's home asteroid score");
    assertEq(Score.get(bobHomeAsteroid), bobHomeScore, "bobs home score should not have changed");
    assertEq(Score.get(bobEntity), 0, "bob's score should reset to zero after losing asteroid control");

    assertEq(OwnedBy.get(bobHomeAsteroid), aliceEntity, "asteroid should have been taken over");

    assertEq(UnitCount.get(bobFleet, minuteman), 0, "fleet should have been disbanded and marine units");
    assertEq(
      UnitCount.get(bobFleet, capitalShipPrototype),
      0,
      "fleet should have been disbanded and colony ship unit lost"
    );

    assertEq(FleetMovement.getDestination(bobFleet), bobHomeAsteroid, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getOrigin(bobFleet), bobHomeAsteroid, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getArrivalTime(bobFleet), block.timestamp, "fleet should have been reset to orbit");
    assertEq(FleetMovement.getSendTime(bobFleet), block.timestamp, "fleet should have been reset to orbit");

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

  function testFleetAttackMultipleCapitalShips() public {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    //create fleet with 1 minuteman marine
    bytes32 minuteman = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 capitalShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.CapitalShip));
    uint256 decryption = P_CapitalShipConfig.getDecryption();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == capitalShipPrototype) unitCounts[i] = 2;
    }

    //create fleet with 1 iron
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    //provide resource and unit requirements to create fleet
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);
    setupCreateFleet(alice, aliceHomeAsteroid, unitCounts, resourceCounts);

    vm.startPrank(alice);
    bytes32 fleetId = world.Primodium__createFleet(aliceHomeAsteroid, unitCounts, resourceCounts);
    console.log("number of capital ships:", UnitCount.get(fleetId, capitalShipPrototype));
    vm.stopPrank();

    vm.startPrank(alice);
    world.Primodium__sendFleet(fleetId, bobHomeAsteroid);
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

    vm.warp(FleetMovement.getArrivalTime(fleetId));
    vm.startPrank(alice);
    world.Primodium__attack(fleetId, bobHomeAsteroid);
    vm.stopPrank();

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.R_HP)),
      0,
      "asteroid hp should have been reduced by unit attack"
    );

    assertEq(LibCombatAttributes.getCargo(fleetId), 0, "fleet should not have raided");

    assertEq(
      ResourceCount.get(bobHomeAsteroid, uint8(EResource.Iron)),
      ironAmount,
      "asteroid should not have been raided"
    );

    console.log("encryption: %s decryption: %s", ResourceCount.get(fleetId, uint8(EResource.R_Encryption)), decryption);
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
