// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

/*


Function: getDefensePoints

Edge Cases
No units for defender
Multiple types of units
UnitLevel changes

Special Cases
Invalid bytes32 entities
Function: getAttackPoints

Basic Scenario
Compute with known attackerEntity, rockEntity, sendType

Edge Cases
No arrivals
Multiple types of units
UnitLevel changes

Special Cases
Invalid bytes32 entities
Invalid ESendType

Timing
arrivalTime is in the future
arrivalTime is in the past
*/

contract LibBattleTest is PrimodiumTest {
  bytes32 player;
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 rock = "rock";

  Arrival arrival =
    Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: [uint256(0), 0, 0, 0, 0]
    });
  bytes32 arrivalId = keccak256(abi.encode(arrival));

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, mining: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
    bytes32[] memory unitTypes = new bytes32[](unitPrototypeCount);
    unitTypes[0] = unit1;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
    vm.warp(1000);
  }

  function setupUnit(
    bytes32 unit,
    uint256 attack,
    uint256 defense
  ) internal {
    P_Unit.set(
      unit,
      0,
      P_UnitData({ attack: attack, defense: defense, speed: 0, cargo: 0, mining: 0, trainingTime: 0 })
    );
  }

  function testGetDefensePoints(uint256 unitCount, uint256 defense) public returns (uint256) {
    vm.assume(unitCount < 10000);
    vm.assume(defense < 10000);
    UnitCount.set(player, rock, unit1, unitCount);
    setupUnit(unit1, 0, defense);

    uint256 expected = unitCount * defense;
    (uint256 count, uint256 actual) = LibBattle.getDefensePoints(player, rock);
    assertEq(count, unitCount);
    assertEq(actual, expected, "Defense points should be equal to unitCount * defense");
    return expected;
  }

  function testGetAttackPoints(uint256 unitCount, uint256 attack) public returns (uint256) {
    vm.assume(unitCount < 10000);
    vm.assume(attack < 10000);
    vm.warp(1000);

    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = 0;
    arrival.unitCounts[0] = unitCount;

    ArrivalsMap.set(player, rock, arrivalId, arrival);
    setupUnit(unit1, attack, 0);

    uint256 expected = unitCount * attack;
    (uint256 count, uint256 actual) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count, unitCount);
    assertEq(actual, expected, "Attack points should be equal to unitCount * attack");
    return expected;
  }

  function testGetAttackPointsMultiple(
    uint256 unitCount,
    uint256 attack,
    uint256 unitCount2,
    uint256 attack2
  ) public {
    vm.assume(unitCount < 10000);
    vm.assume(attack < 10000);
    vm.assume(unitCount2 < 10000);
    vm.assume(attack2 < 10000);

    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = 0;
    arrival.unitCounts[0] = unitCount;

    uint256[5] memory newUnitCounts;
    newUnitCounts[1] = unitCount2;

    setupUnit(unit1, attack, 0);
    setupUnit(unit2, attack2, 0);

    ArrivalsMap.set(player, rock, arrivalId, arrival);
    Arrival memory arrival2 = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: newUnitCounts
    });

    ArrivalsMap.set(player, rock, "arrival2", arrival2);

    uint256 expected = unitCount * attack + unitCount2 * attack2;
    (uint256 count, uint256 actual) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count, unitCount + unitCount2);
    assertEq(actual, expected, "Attack points should be equal to unitCount * attack");
  }

  /*
    Basic Scenario
Attacker wins
Defender wins

Edge Cases
attackPoints == defensePoints
attackPoints == 0
defensePoints == 0
Unit counts are zero
Multiple types of units involved

Special Cases
Invalid ESendType
Invalid bytes32 entities
    */

  function testBattleAttackerWins() public {
    // setup attacker
    uint256 attackerUnitCount = 100;
    uint256 attackerAttack = 100;

    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = 69;
    arrival.unitCounts[0] = attackerUnitCount;

    ArrivalsMap.set(player, rock, arrivalId, arrival);

    // setup defender
    uint256 defenderUnitCount = 100;
    uint256 defenderDefense = 50;

    UnitCount.set(enemy, rock, unit1, defenderUnitCount);

    setupUnit(unit1, attackerAttack, defenderDefense);

    (uint256 count, uint256 attackPoints) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    (uint256 defenseCount, uint256 defensePoints) = LibBattle.getDefensePoints(enemy, rock);

    // getAttackPoints removes the arrival from the map so we readd it here
    ArrivalsMap.set(player, rock, arrivalId, arrival);

    BattleResultData memory result = LibBattle.battle(player, enemy, rock, ESendType.Invade);
    assertEq(toString(result.winner), toString(player), "Attacker should win");
    assertEq(result.defenderUnitsLeft[0], 0, "Defender should have 0 units left");
    uint256 lossPoints = (100 - (defensePoints * 100) / attackPoints);
    uint256 unitsLeft = (attackerUnitCount * lossPoints) / 100;
    assertEq(result.attackerUnitsLeft[0], unitsLeft, "Attacker should have correct units left");
  }

  function testBattleDefenderWins() public {
    // setup attacker
    uint256 attackerUnitCount = 100;
    uint256 attackerAttack = 100;

    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = 69;
    arrival.unitCounts[0] = attackerUnitCount;

    ArrivalsMap.set(player, rock, arrivalId, arrival);

    // setup defender
    uint256 defenderUnitCount = 250;
    uint256 defenderDefense = 50;

    UnitCount.set(enemy, rock, unit1, defenderUnitCount);

    setupUnit(unit1, attackerAttack, defenderDefense);

    (uint256 count, uint256 attackPoints) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    (uint256 defenseCount, uint256 defensePoints) = LibBattle.getDefensePoints(enemy, rock);

    // getAttackPoints removes the arrival from the map so we readd it here
    ArrivalsMap.set(player, rock, arrivalId, arrival);

    BattleResultData memory result = LibBattle.battle(player, enemy, rock, ESendType.Invade);
    assertEq(toString(result.winner), toString(enemy), "Attacker should win");
    assertEq(result.attackerUnitsLeft[0], 0, "Attacker should have 0 units left");
    uint256 lossPoints = (100 - (attackPoints * 100) / defensePoints);
    uint256 unitsLeft = (defenderUnitCount * lossPoints) / 100;
    assertEq(result.defenderUnitsLeft[0], unitsLeft, "Attacker should have correct units left");
  }
}
