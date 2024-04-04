// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest, toString } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { P_IsUtility, ClaimOffset, Position, PositionData, UnitCount, MaxResourceCount, Value_UnitProductionQueueData, P_UnitProdTypes, BuildingType, P_GameConfigData, P_GameConfig, Asteroid, Home, OwnedBy, Level, LastClaimedAt, P_Unit, P_UnitProdMultiplier, ResourceCount, ResourceCount, P_RequiredResources, P_RequiredResourcesData, ColonySlots, P_Transportables, P_UnitPrototypes, P_EnumToPrototype, P_ColonySlotsConfigData, P_ColonySlotsConfig, MaxResourceCount, ResourceCount, ColonySlotsInstallments, ColonySlotsInstallmentsData } from "codegen/index.sol";

import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { LibColony } from "libraries/LibColony.sol";
import { LibUnit } from "libraries/LibUnit.sol";

contract LibColonyTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 creatorHomeAsteroid;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    world.Primodium__spawn();

    OwnedBy.set(Home.get(playerEntity), playerEntity);
    creatorHomeAsteroid = Home.get(playerEntity);
    // P_GameConfigData memory config = P_GameConfig.get();
    // config.unitProductionRate = 100;
    // P_GameConfig.set(config);
  }

  function testIncreaseColonySlotsCapacity() public {
    assertEq(LibColony.increaseColonySlotsCapacity(playerEntity), 2);
    assertEq(LibColony.increaseColonySlotsCapacity(playerEntity), 3);
  }

  function testGetColonyShipsPlusAsteroids() public {
    vm.startPrank(creator);
    assertEq(ColonySlots.getCapacity(playerEntity), 1);
    LibColony.increaseColonySlotsCapacity(playerEntity);
    assertEq(ColonySlots.getCapacity(playerEntity), 2);

    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 1);
    trainUnits(creator, ColonyShipPrototypeId, 1, true);
    vm.startPrank(creator);
    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 2);

    // prepare to make a fleet for testing
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256 numberOfUnits = 10;

    // do a fleet with some minutemen and one more colony ship
    bytes32 minuteman = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    bytes32 colonyShipPrototype = P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip));

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minuteman) unitCounts[i] = numberOfUnits;
      if (unitPrototypes[i] == colonyShipPrototype) unitCounts[i] = 1;
    }
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());

    // train and setup everything
    LibColony.increaseColonySlotsCapacity(playerEntity);
    setupCreateFleet(creator, creatorHomeAsteroid, unitCounts, resourceCounts);
    vm.startPrank(creator);
    // create the fleet
    world.Primodium__createFleet(creatorHomeAsteroid, unitCounts, resourceCounts);
    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 3);
  }

  // todo: make the multiplier a prototypeConfig changeable value
  function testGetColonySlotsCostMultiplier() public {
    assertEq(ColonySlots.getCapacity(playerEntity), 1);
    assertEq(LibColony.getColonySlotsCostMultiplier(playerEntity), 4);

    LibColony.increaseColonySlotsCapacity(playerEntity);

    assertEq(ColonySlots.getCapacity(playerEntity), 2);
    assertEq(LibColony.getColonySlotsCostMultiplier(playerEntity), 8);

    LibColony.increaseColonySlotsCapacity(playerEntity);

    assertEq(ColonySlots.getCapacity(playerEntity), 3);
    assertEq(LibColony.getColonySlotsCostMultiplier(playerEntity), 12);
  }

  // todo: test buying a colony slot in full payment
  function testPayForColonySlotsCapacity() public {
    P_ColonySlotsConfigData memory costData = P_ColonySlotsConfig.get();
    P_ColonySlotsConfigData memory payment;
    payment.resources = new uint8[](costData.resources.length);
    payment.amounts = new uint256[](costData.amounts.length);

    uint256 colonySlotsCostMultiplier = LibColony.getColonySlotsCostMultiplier(playerEntity);
    uint256 currentSlotCapacity = ColonySlots.getCapacity(playerEntity);

    assertEq(currentSlotCapacity, 1);
    assertEq(colonySlotsCostMultiplier, currentSlotCapacity * 4);

    // Pass empty payment data
    vm.expectRevert("[SpendResources] Payment data does not match cost data");
    world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);

    // Pass payment data with different resources but correct amounts
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i] + 1;
      uint256 amount = costData.amounts[i] * colonySlotsCostMultiplier;
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }
    vm.expectRevert("[SpendResources] Payment data does not match cost data");
    world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);

    // properly structure the payment data but don't own enough resources
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = costData.amounts[i] * colonySlotsCostMultiplier;
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, 0);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }
    vm.expectRevert("[SpendResources] Not enough resources to spend");
    world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);

    // properly get the max resources and resource count for each resource in costData
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = costData.amounts[i] * colonySlotsCostMultiplier;
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }

    world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);
    currentSlotCapacity = ColonySlots.getCapacity(playerEntity);
    uint256 prevColonySlotsCostMultiplier = colonySlotsCostMultiplier;
    colonySlotsCostMultiplier = LibColony.getColonySlotsCostMultiplier(playerEntity);
    assertEq(currentSlotCapacity, 2);
    assertEq(colonySlotsCostMultiplier, currentSlotCapacity * 4);

    // Check that installments amounts are currently empty (resources are already initialized from first payment)
    ColonySlotsInstallmentsData memory installments = ColonySlotsInstallments.get(playerEntity);
    for (uint256 i = 0; i < payment.resources.length; i++) {
      assertEq(installments.amounts[i], 0, "installment amounts should be empty");
    }

    // Try to pay for another slot with same amount, but it's now not enough so it becomes an installment
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = costData.amounts[i] * prevColonySlotsCostMultiplier;
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }
    bool fullPayment = world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);
    assertEq(fullPayment, false);
    currentSlotCapacity = ColonySlots.getCapacity(playerEntity);
    colonySlotsCostMultiplier = LibColony.getColonySlotsCostMultiplier(playerEntity);
    assertEq(currentSlotCapacity, 2);
    assertEq(colonySlotsCostMultiplier, currentSlotCapacity * 4);
    installments = ColonySlotsInstallments.get(playerEntity);

    // because foundry doesn't have a way to compare uint8[] arrays, we need to compare each element
    for (uint256 i = 0; i < payment.resources.length; i++) {
      assertEq(installments.resources[i], payment.resources[i], "installment resources should match payment resources");
    }
    assertEq(installments.amounts, payment.amounts, "installment amounts should match payment amounts");

    // check additional installment doesn't overwrite the previous one
    // check installment of just one resource

    // check no overpayment
  }

  // todo: test cost increase of Colony Slot

  // TrainUnitsSystem.t.sol
  // function testTrainColonyShipsCostIncrease() public {
  //   uint256 initialShips = LibUnit.getColonyShipsPlusAsteroids(aliceEntity);
  //   uint256 initialMultiplier = LibUnit.getColonyShipCostMultiplier(aliceEntity);
  //   assertEq(initialShips, 0, "initial ship and asteroid count");

  //   uint256 amount = P_ColonyShipConfig.getInitialCost() * initialMultiplier;
  //   uint8 resource = P_ColonyShipConfig.getResource();
  //   increaseResource(aliceAsteroidEntity, EResource(resource), amount);
  //   increaseResource(aliceAsteroidEntity, EResource.U_ColonyShipCapacity, 1);
  //   trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip)), 1, true);
  //   assertEq(LibUnit.getColonyShipsPlusAsteroids(aliceEntity), initialShips + 1, "colony ship count");
  //   assertEq(LibUnit.getColonyShipCostMultiplier(aliceEntity), initialMultiplier * 2, "colony ship cost multiplier");

  //   assertEq(
  //     amount * 2,
  //     P_ColonyShipConfig.getInitialCost() * LibUnit.getColonyShipCostMultiplier(aliceEntity),
  //     "colony ship 1 cost"
  //   );

  //   increaseResource(aliceAsteroidEntity, EResource(resource), amount * 2);
  //   increaseResource(aliceAsteroidEntity, EResource.U_ColonyShipCapacity, 1);
  //   trainUnits(alice, Home.get(aliceAsteroidEntity), P_EnumToPrototype.get(UnitKey, uint8(EUnit.ColonyShip)), 1, true);
  //   assertEq(LibUnit.getColonyShipsPlusAsteroids(aliceEntity), initialShips + 2, "colony ship 2 count");
  //   assertEq(LibUnit.getColonyShipCostMultiplier(aliceEntity), initialMultiplier * 2 * 2, "colony ship 2 cost");

  //   assertEq(
  //     amount * 4,
  //     P_ColonyShipConfig.getInitialCost() * LibUnit.getColonyShipCostMultiplier(aliceEntity),
  //     "next colony ship 2 cost"
  //   );
  // }

  // todo: test primary asteroid counts
  // todo: test colony ship in training
  // todo: test claimed colony ship
  // todo: test self-transfer colony ship (from fleet to fleet of same player, asteroid to fleet of same player, etc.)
  // todo: test transfer colony ship, does it remove from old player and add to new player, does it revert when invalid

  // TransferSystem.t.sol
  // function testTransferColonyShipBetweenPlayers() public {
  //   bytes32 aliceFleet = createColonyShipFleet(alice);
  //   bytes32 bobFleet = createColonyShipFleet(bob);

  //   vm.prank(creator);
  //   P_GameConfig.setWorldSpeed(100);
  //   vm.prank(alice);
  //   world.Primodium__sendFleet(aliceFleet, bobHomeAsteroid);
  //   console.log("aliceFleet arrival time", FleetMovement.getArrivalTime(aliceFleet));
  //   vm.warp(block.timestamp + 10000000);

  //   bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
  //   uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
  //   uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
  //   for (uint256 i = 0; i < unitPrototypes.length; i++) {
  //     if (unitPrototypes[i] == ColonyShipPrototypeId) unitCounts[i] = 1;
  //   }

  //   vm.startPrank(alice);
  //   vm.expectRevert("[Fleet] Cannot transfer colony ships to other players");
  //   world.Primodium__transferUnitsFromFleetToFleet(aliceFleet, bobFleet, unitCounts);

  //   vm.expectRevert("[Fleet] Cannot transfer colony ships to other players");
  //   world.Primodium__transferUnitsFromFleetToAsteroid(aliceFleet, bobHomeAsteroid, unitCounts);

  //   vm.expectRevert("[Fleet] Cannot transfer colony ships to other players");
  //   world.Primodium__transferUnitsAndResourcesFromFleetToAsteroid(
  //     aliceFleet,
  //     bobHomeAsteroid,
  //     unitCounts,
  //     resourceCounts
  //   );

  //   vm.expectRevert("[Fleet] Cannot transfer colony ships to other players");
  //   world.Primodium__transferUnitsAndResourcesFromFleetToFleet(aliceFleet, bobFleet, unitCounts, resourceCounts);
  // }

  // todo: test battle destroyed colony ship
  // todo: test capturing an asteroid and checking count (spent colony ship to gain asteroid)
  // todo: test wormhole asteroid counts
  // todo: test secondary asteroid counts
  // todo: test losing an asteroid when another player captures yours
  // todo: test losing an asteroid that was training a colony ship
  // todo: what if the order of the installment resource types is different??? probably need to require the same order at the beginning of the function.
  // todo: players may try to stash resources in slot payments to avoid losing them in battle. Need to have a way to prevent this, likely by adding a stash inside the main base that can be looted if base is captured, or pulled for full payment when ready to pay in full.
  // todo: in the future add a few hr lock between making an installment and being able to use it (so that people don't use creative ways to avoid losing resources for imminent battle)
}
