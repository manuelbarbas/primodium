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

    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 1, "primary asteroid should count as a colony slot");
    trainUnits(creator, ColonyShipPrototypeId, 1, true);
    vm.startPrank(creator);
    assertEq(
      LibUnit.getColonyShipsPlusAsteroids(playerEntity),
      2,
      "trained and claimed colony ship isn't being counted"
    );

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
    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 3, "colony ship on asteroid isn't being counted");

    vm.startPrank(creator);
    // create the fleet
    world.Primodium__createFleet(creatorHomeAsteroid, unitCounts, resourceCounts);
    assertEq(
      LibUnit.getColonyShipsPlusAsteroids(playerEntity),
      3,
      "colony ship transfer from asteroid to fleet isn't being counted"
    );

    // Start colony ship training but don't claim it
    LibColony.increaseColonySlotsCapacity(playerEntity);
    trainUnits(creator, ColonyShipPrototypeId, 1, false);
    vm.startPrank(creator);
    assertEq(LibUnit.getColonyShipsPlusAsteroids(playerEntity), 4, "colony ship in training isn't being counted");
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

    // ------------

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

    // ------------

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

    // ------------

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

    // ------------

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

    // ------------

    // check additional installment doesn't overwrite the previous one, and do it for just one resource
    ColonySlotsInstallmentsData memory prevInstallments = installments;

    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount;

      if (i == 0) {
        amount = 1;
      } else {
        amount = 0;
      }
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }
    fullPayment = world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);
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

    uint256[] memory totalInstallmentsCheck = new uint256[](payment.resources.length);
    // add the amounts of the payment and the previous installment
    for (uint i = 0; i < payment.resources.length; i++) {
      totalInstallmentsCheck[i] = payment.amounts[i] + prevInstallments.amounts[i];
    }

    assertEq(
      installments.amounts,
      totalInstallmentsCheck,
      "installment amounts should match payment + prevInstallment amounts"
    );

    // ------------

    // check no overpayment without full payment (just one resource)

    assertGt(costData.resources.length, 1, "Colony Slots Config Data resources length is less than 2 for next test");
    // get remaining amount required for all resources
    P_ColonySlotsConfigData memory remainingCost;
    remainingCost.resources = new uint8[](costData.resources.length);
    remainingCost.amounts = new uint256[](costData.amounts.length);
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = costData.amounts[i] * colonySlotsCostMultiplier - installments.amounts[i];
      remainingCost.resources[i] = resource;
      remainingCost.amounts[i] = amount;
    }

    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount;
      if (i == 0) {
        amount = remainingCost.amounts[i] + 1;
      } else {
        amount = 0;
      }
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }

    fullPayment = world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);
    assertEq(fullPayment, false);
    currentSlotCapacity = ColonySlots.getCapacity(playerEntity);
    colonySlotsCostMultiplier = LibColony.getColonySlotsCostMultiplier(playerEntity);
    assertEq(currentSlotCapacity, 2);
    assertEq(colonySlotsCostMultiplier, currentSlotCapacity * 4);
    installments = ColonySlotsInstallments.get(playerEntity);

    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint256 asteroidResourceAmounts = ResourceCount.get(creatorHomeAsteroid, remainingCost.resources[i]);
      if (i == 0) {
        assertEq(asteroidResourceAmounts, 1, "no rebate from overpayment");
        assertEq(
          installments.amounts[i],
          costData.amounts[i] * colonySlotsCostMultiplier,
          "installments should be at full cost for the resource that was paid for in full"
        );
      } else {
        assertEq(asteroidResourceAmounts, 0, "asteroid resource amounts should be 0");
      }
    }

    // ------------

    // check no overpayment with full payment

    assertGt(costData.resources.length, 1, "Colony Slots Config Data resources length is less than 2 for next test");
    // get remaining amount required for all resources
    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = costData.amounts[i] * colonySlotsCostMultiplier - installments.amounts[i];
      remainingCost.resources[i] = resource;
      remainingCost.amounts[i] = amount;
    }

    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint8 resource = costData.resources[i];
      uint256 amount = remainingCost.amounts[i] + 2;
      MaxResourceCount.set(creatorHomeAsteroid, resource, amount);
      ResourceCount.set(creatorHomeAsteroid, resource, amount);
      payment.resources[i] = resource;
      payment.amounts[i] = amount;
    }

    fullPayment = world.Primodium__payForColonySlotsCapacity(creatorHomeAsteroid, payment);
    assertEq(fullPayment, true);
    currentSlotCapacity = ColonySlots.getCapacity(playerEntity);
    colonySlotsCostMultiplier = LibColony.getColonySlotsCostMultiplier(playerEntity);
    assertEq(currentSlotCapacity, 3);
    assertEq(colonySlotsCostMultiplier, currentSlotCapacity * 4);
    installments = ColonySlotsInstallments.get(playerEntity);

    for (uint256 i = 0; i < costData.resources.length; i++) {
      uint256 asteroidResourceAmounts = ResourceCount.get(creatorHomeAsteroid, remainingCost.resources[i]);
      assertEq(asteroidResourceAmounts, 2, "missing a rebate from overpayment");
      assertEq(installments.amounts[i], 0, "installments should be reset to 0");
    }
  }

  // todo: fix case when losing an asteroid that was training a colony ship
  // todo: fix case when losing an asteroid that owns a colony ship, have to destroy the colony ship if player has no other colony slots
  // todo: (future release) players may try to stash resources in slot payments to avoid losing them in battle. Need to have a way to prevent this, likely by adding a stash inside the main base that can be looted if base is captured, or pulled for full payment when ready to pay in full.
  // todo: (future release) in the future add a few hr lock between making an installment and being able to use it (so that people don't use creative ways to avoid losing resources for imminent battle)
}
