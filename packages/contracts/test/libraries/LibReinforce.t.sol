// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/*
reinforce Function
Test with valid and invalid playerEntity, rockEntity, and arrivalId.
Check if the unit counts are updated correctly.
Test with arrival.sendType not equal to ESendType.Reinforce.
Validate if ArrivalCount and ArrivalsMap are updated.

recallReinforcement Function
Test recalling reinforcements under different conditions like past and future arrival times.
Test when arrival.from is not equal to playerEntity.
Test when arrival.sendType is not ESendType.Reinforce.
Validate if units are added back to Home.getAsteroid(playerEntity).

recallAllReinforcements Function
Test with a rock that is not owned.
Test with multiple arrivals.
Validate if all arrivals are recalled.

Unit Count
Check if unit counts are properly incremented and decremented during reinforce and recall.

Ownership Checks
Test scenarios where the player does and doesn't own the rock.

Utility Updates
Test the utility update functionality when the sender and receiver are different.

Edge Cases
Test when unit counts in an arrival are zero.

Function Calls
Ensure that other library functions (LibUnit.addUnitsToAsteroid, LibUnit.updateStoredUtilities, etc.) are called as expected.

Gas Usage
Profile gas usage for key functions.
Each test should confirm that the contract behaves as expected. Now write the tests.
*/
import "test/PrimodiumTest.t.sol";

contract LibReinforceTest is PrimodiumTest {
  bytes32 player;
  bytes32 destination = "destination";

  bytes32 unit = "unit";
  bytes32 unitPrototype = "unitPrototype";

  bytes32 unit2 = "unit2";
  bytes32 unitPrototype2 = "unitPrototype2";
  uint256[] unitCounts;
  bytes32[] unitTypes;

  Arrival arrival =
    Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

  bytes32 arrivalId = "arrival";

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, mining: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
    arrival.from = player;
  }

  function testReinforce() public {
    ArrivalCount.set(player, 10);
    arrival.sendType = ESendType.Reinforce;

    unitCounts.push(47);
    unitTypes.push(unit);
    arrival.unitCounts = unitCounts;
    arrival.unitTypes = unitTypes;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);

    assertEq(ArrivalCount.get(player), 9);
    assertFalse(ArrivalsMap.has(player, destination, arrivalId));
    assertEq(UnitCount.get(player, destination, unit), 47);
  }

  function testReinforceAnotherPlayer() public {
    ArrivalCount.set(player, 10);
    ArrivalCount.set(arrival.from, 10);

    arrival.sendType = ESendType.Reinforce;
    arrival.from = "anotherPlayer";
    ArrivalCount.set(arrival.from, 10);
    unitCounts.push(1);
    unitTypes.push(unit);
    arrival.unitCounts = unitCounts;
    arrival.unitTypes = unitTypes;

    P_IsUtility.set(EResource.Iron, true);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 1, requiredResourcesData);

    uint256 before = 75;
    MaxResourceCount.set(player, EResource.Iron, before + 33);

    ResourceCount.set(player, EResource.Iron, before);
    ResourceCount.set(arrival.from, EResource.Iron, before);

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);

    console.log("hello");
    assertEq(ResourceCount.get(arrival.from, EResource.Iron), before - 33);
    assertEq(ResourceCount.get(player, EResource.Iron), before + 33);
  }

  function testFailReinforceWrongSendType() public {
    arrival.sendType = ESendType.Invade;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);
  }

  function testFailReinforceTooEarly() public {
    arrival.sendType = ESendType.Reinforce;
    arrival.arrivalTime = block.timestamp + 1;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);
  }
}
