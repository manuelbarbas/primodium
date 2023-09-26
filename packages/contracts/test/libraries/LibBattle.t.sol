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
  bytes32 homeRock = "homeRock";

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
    (uint256[] memory count, uint256 actual) = LibBattle.getDefensePoints(player, rock);
    assertEq(count[0], unitCount);
    assertEq(actual, expected, "Defense points should be equal to unitCount * defense");
    return expected;
  }

  function testGetDefensePointsMultiple() public {
    uint256 unitCount = 97;
    uint256 defense = 131;

    uint256 unitCount2 = 67;
    uint256 defense2 = 109;
    UnitCount.set(player, rock, unit1, unitCount);
    UnitCount.set(player, rock, unit2, unitCount2);
    setupUnit(unit1, 0, defense);
    setupUnit(unit2, 0, defense2);

    uint256 expected = unitCount * defense;
    uint256 expected2 = unitCount2 * defense2;
    (uint256[] memory count, uint256 actual) = LibBattle.getDefensePoints(player, rock);
    assertEq(count[0], unitCount);
    assertEq(count[1], unitCount2);
    assertEq(actual, expected + expected2, "Defense points should be equal to unitCount * defense");
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
    (uint256[] memory count, uint256 actual, uint256 cargo) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count[0], unitCount);
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
    (uint256[] memory count, uint256 actual, uint256 cargo) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count[0], unitCount);
    assertEq(count[1], unitCount2);
    assertEq(actual, expected, "Attack points should be equal to unitCount * attack");
  }

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

    (uint256[] memory count, uint256 attackPoints, uint256 cargo) = LibBattle.getAttackPoints(
      player,
      rock,
      ESendType.Invade
    );
    (uint256[] memory defenseCount, uint256 defensePoints) = LibBattle.getDefensePoints(enemy, rock);

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

    (uint256[] memory count, uint256 attackPoints, uint256 cargo) = LibBattle.getAttackPoints(
      player,
      rock,
      ESendType.Invade
    );
    (uint256[] memory defenseCount, uint256 defensePoints) = LibBattle.getDefensePoints(enemy, rock);

    // getAttackPoints removes the arrival from the map so we read it here
    ArrivalsMap.set(player, rock, arrivalId, arrival);

    BattleResultData memory result = LibBattle.battle(player, enemy, rock, ESendType.Invade);
    assertEq(toString(result.winner), toString(enemy), "Attacker should win");
    assertEq(result.attackerUnitsLeft[0], 0, "Attacker should have 0 units left");
    uint256 lossPoints = (100 - (attackPoints * 100) / defensePoints);
    uint256 unitsLeft = (defenderUnitCount * lossPoints) / 100;
    assertEq(result.defenderUnitsLeft[0], unitsLeft, "Attacker should have correct units left");
  }

  // struct BattleResultData {
  //   bytes32 attacker;
  //   bytes32 defender;
  //   bytes32 winner;
  //   bytes32 rock;
  //   uint256 totalCargo;
  //   uint256 timestamp;
  //   uint256[] attackerStartingUnits;
  //   uint256[] defenderStartingUnits;
  //   uint256[] attackerUnitsLeft;
  //   uint256[] defenderUnitsLeft;
  // }

  uint256 playerOriginalIron = 1000;
  uint256 playerOriginalCopper = 500;
  uint256 enemyOriginalIron = 1000;
  uint256 enemyOriginalCopper = 500;

  function setupUpdateUnitsAfterBattle() public {
    P_IsUtility.set(EResource.Iron, true);
    P_IsUtility.set(EResource.Copper, true);

    // unit1 requires 1 iron

    ResourceCount.set(player, EResource.Iron, playerOriginalIron);
    ResourceCount.set(player, EResource.Copper, playerOriginalCopper);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    // unit2 requires 1 copper

    ResourceCount.set(enemy, EResource.Iron, enemyOriginalIron);
    ResourceCount.set(enemy, EResource.Copper, enemyOriginalCopper);

    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Copper);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit2, 0, requiredResourcesData);
  }

  function testUpdateUnitsAfterBattleInvadeAttackerWins() public {
    setupUpdateUnitsAfterBattle();

    BattleResultData memory br = BattleResultData({
      attacker: player,
      defender: enemy,
      winner: player,
      rock: rock,
      totalCargo: 0,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      defenderStartingUnits: getUnitArray(100, 10),
      attackerUnitsLeft: getUnitArray(50, 20),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

    LibBattle.updateUnitsAfterBattle(br, ESendType.Invade);
    assertEq(UnitCount.get(player, rock, unit1), 50, "Attacker should have 50 units on rock");
    assertEq(UnitCount.get(player, rock, unit2), 20, "Attacker should have 20 unit2s on rock");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Defender should have 0 units on rock");
    assertEq(UnitCount.get(enemy, rock, unit2), 0, "Defender should have 0 unit2s on rock");

    // both players should have their utilities removed

    // diff from start to finish is 50
    assertEq(ResourceCount.get(player, EResource.Iron), playerOriginalIron - 50, "Attacker should lose 50 iron");
    // diff from start to finish is 30
    assertEq(ResourceCount.get(player, EResource.Copper), playerOriginalCopper - 30, "Attacker should lose 30 copper");

    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, EResource.Iron), enemyOriginalIron - 100, "Enemy should lose 100 iron");
    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, EResource.Copper), enemyOriginalCopper - 10, "Enemy should lose 10 copper");
  }

  function testUpdateUnitsAfterBattleInvadeDefenderWins() public {
    setupUpdateUnitsAfterBattle();
    UnitCount.set(enemy, rock, unit1, 100);
    UnitCount.set(enemy, rock, unit2, 10);

    BattleResultData memory br = BattleResultData({
      attacker: player,
      defender: enemy,
      winner: enemy,
      rock: rock,
      totalCargo: 0,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      attackerUnitsLeft: getUnitArray(0, 0),
      defenderStartingUnits: getUnitArray(100, 10),
      defenderUnitsLeft: getUnitArray(70, 5)
    });

    LibBattle.updateUnitsAfterBattle(br, ESendType.Invade);
    assertEq(UnitCount.get(player, rock, unit1), 0, "Attacker should have 0 units on rock");
    assertEq(UnitCount.get(player, rock, unit2), 0, "Attacker should have 0 unit2s on rock");
    assertEq(UnitCount.get(enemy, rock, unit1), 70, "Defender should have 70 units on rock");
    assertEq(UnitCount.get(enemy, rock, unit2), 5, "Defender should have 0 unit2s on rock");

    // both players should have their utilities removed

    assertEq(ResourceCount.get(player, EResource.Iron), playerOriginalIron - 100, "Attacker should lose 50 iron");
    assertEq(ResourceCount.get(player, EResource.Copper), playerOriginalCopper - 50, "Attacker should lose 30 copper");

    assertEq(ResourceCount.get(enemy, EResource.Iron), enemyOriginalIron - 30, "Defender should lose 30 iron");
    assertEq(ResourceCount.get(enemy, EResource.Copper), enemyOriginalCopper - 5, "Defender should lose 5 copper");
  }

  function testUpdateUnitsAfterBattleRaidAttackerWins() public {
    setupUpdateUnitsAfterBattle();
    Home.setAsteroid(player, homeRock);
    UnitCount.set(enemy, rock, unit1, 100);
    UnitCount.set(enemy, rock, unit2, 10);

    BattleResultData memory br = BattleResultData({
      attacker: player,
      defender: enemy,
      winner: player,
      rock: rock,
      totalCargo: 0,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      defenderStartingUnits: getUnitArray(100, 10),
      attackerUnitsLeft: getUnitArray(50, 20),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

    LibBattle.updateUnitsAfterBattle(br, ESendType.Raid);
    assertEq(UnitCount.get(player, homeRock, unit1), 50, "Attacker should have 50 units on home rock");
    assertEq(UnitCount.get(player, homeRock, unit2), 20, "Attacker should have 20 unit2s on home rock");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Defender should have 0 units on rock");
    assertEq(UnitCount.get(enemy, rock, unit2), 0, "Defender should have 0 unit2s on rock");

    // both players should have their utilities removed

    // diff from start to finish is 50
    assertEq(ResourceCount.get(player, EResource.Iron), playerOriginalIron - 50, "Attacker should lose 50 iron");
    // diff from start to finish is 30
    assertEq(ResourceCount.get(player, EResource.Copper), playerOriginalCopper - 30, "Attacker should lose 30 copper");

    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, EResource.Iron), enemyOriginalIron - 100, "Enemy should lose 100 iron");
    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, EResource.Copper), enemyOriginalCopper - 10, "Enemy should lose 10 copper");
  }

  function testUpdateUnitsAfterBattleRaidDefenderWins() public {
    setupUpdateUnitsAfterBattle();
    Home.setAsteroid(player, homeRock);
    UnitCount.set(enemy, rock, unit1, 100);
    UnitCount.set(enemy, rock, unit2, 10);

    BattleResultData memory br = BattleResultData({
      attacker: player,
      defender: enemy,
      winner: enemy,
      rock: rock,
      totalCargo: 0,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      attackerUnitsLeft: getUnitArray(0, 0),
      defenderStartingUnits: getUnitArray(100, 10),
      defenderUnitsLeft: getUnitArray(70, 5)
    });

    LibBattle.updateUnitsAfterBattle(br, ESendType.Invade);
    assertEq(UnitCount.get(player, homeRock, unit1), 0, "Attacker should have 0 units on home rock");
    assertEq(UnitCount.get(player, homeRock, unit2), 0, "Attacker should have 0 unit2s on home rock");
    assertEq(UnitCount.get(enemy, rock, unit1), 70, "Defender should have 70 units on rock");
    assertEq(UnitCount.get(enemy, rock, unit2), 5, "Defender should have 0 unit2s on rock");

    // both players should have their utilities removed

    assertEq(ResourceCount.get(player, EResource.Iron), playerOriginalIron - 100, "Attacker should lose 50 iron");
    assertEq(ResourceCount.get(player, EResource.Copper), playerOriginalCopper - 50, "Attacker should lose 30 copper");

    assertEq(ResourceCount.get(enemy, EResource.Iron), enemyOriginalIron - 30, "Defender should lose 30 iron");
    assertEq(ResourceCount.get(enemy, EResource.Copper), enemyOriginalCopper - 5, "Defender should lose 5 copper");
  }
}
