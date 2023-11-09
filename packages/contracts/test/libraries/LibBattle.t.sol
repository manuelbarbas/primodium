// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

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
      sendTime: block.timestamp,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: [uint256(0), 0, 0, 0, 0, 0, 0]
    });
  bytes32 arrivalId = keccak256(abi.encode(arrival));

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(worldAddress);
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
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
    P_Unit.set(unit, 0, P_UnitData({ attack: attack, defense: defense, speed: 0, cargo: 0, trainingTime: 0 }));
  }

  function testGetDefensePointsDefenseBuildings(uint256 unitCount, uint256 defense) public returns (uint256) {
    vm.assume(unitCount < 10000);
    vm.assume(defense < 10000);
    Home.setAsteroid(player, rock);
    UnitCount.set(player, rock, unit1, unitCount);
    setupUnit(unit1, 0, defense);
    ResourceCount.set(player, uint8(EResource.U_Defense), 100);
    uint256 expected = (unitCount * defense) + 100;
    (uint256[] memory count, uint256 actual) = LibBattle.getDefensePoints(player, rock);
    assertEq(count[0], unitCount);
    assertEq(actual, expected, "Defense points should be equal to unitCount * defense");
    return expected;
  }

  function testGetDefensePointsDefenseMultiplierBuildings(uint256 unitCount, uint256 defense) public returns (uint256) {
    vm.assume(unitCount < 10000);
    vm.assume(defense < 10000);
    Home.setAsteroid(player, rock);
    UnitCount.set(player, rock, unit1, unitCount);
    setupUnit(unit1, 0, defense);
    ResourceCount.set(player, uint8(EResource.M_DefenseMultiplier), 200);
    uint256 expected = (unitCount * defense) * 3;
    (uint256[] memory count, uint256 actual) = LibBattle.getDefensePoints(player, rock);
    assertEq(count[0], unitCount);
    assertEq(actual, expected, "Defense points should be equal to unitCount * defense");
    return expected;
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
    ArrivalCount.set(player, 1);

    setupUnit(unit1, attack, 0);

    uint256 expected = unitCount * attack;
    (uint256[] memory count, uint256 actual, uint256 cargo) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count[0], unitCount);
    assertEq(actual, expected, "Attack points should be equal to unitCount * attack");
    assertEq(ArrivalsMap.size(player, rock), 0);
    assertEq(ArrivalCount.get(player), 0);
    assertEq(string(MapItemArrivals.get(player, rock, arrivalId)), "");
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

    uint256[NUM_UNITS] memory newUnitCounts;
    newUnitCounts[1] = unitCount2;

    setupUnit(unit1, attack, 0);
    setupUnit(unit2, attack2, 0);

    ArrivalsMap.set(player, rock, arrivalId, arrival);
    Arrival memory arrival2 = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: newUnitCounts
    });

    ArrivalsMap.set(player, rock, "arrival2", arrival2);
    ArrivalCount.set(player, 2);

    uint256 expected = unitCount * attack + unitCount2 * attack2;
    (uint256[] memory count, uint256 actual, uint256 cargo) = LibBattle.getAttackPoints(player, rock, ESendType.Invade);
    assertEq(count[0], unitCount);
    assertEq(count[1], unitCount2);
    assertEq(actual, expected, "Attack points should be equal to unitCount * attack");
    assertEq(ArrivalsMap.size(player, rock), 0);
    assertEq(ArrivalCount.get(player), 0);
  }

  function testBattleAttackerWins() public {
    // setup attacker
    uint256 attackerUnitCount = 100;
    uint256 attackerAttack = 100;

    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = 69;
    arrival.unitCounts[0] = attackerUnitCount;

    ArrivalsMap.set(player, rock, arrivalId, arrival);
    ArrivalCount.set(player, 1);

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
    ArrivalCount.set(player, 1);

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
    ArrivalCount.set(player, 1);

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
    ArrivalCount.set(player, 1);

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
    P_IsUtility.set(uint8(EResource.Iron), true);
    P_IsUtility.set(uint8(EResource.Copper), true);

    // unit1 requires 1 iron
    LibProduction.increaseResourceProduction(player, EResource.Iron, playerOriginalIron);
    LibProduction.increaseResourceProduction(player, EResource.Copper, playerOriginalCopper);
    //ResourceCount.set(player, uint8(EResource.Iron), playerOriginalIron);
    //ResourceCount.set(player, uint8(EResource.Copper), playerOriginalCopper);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    // unit2 requires 1 copper
    LibProduction.increaseResourceProduction(enemy, EResource.Iron, enemyOriginalIron);
    LibProduction.increaseResourceProduction(enemy, EResource.Copper, enemyOriginalCopper);

    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Copper);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit2, 0, requiredResourcesData);
  }

  function testUpdateUnitsAfterBattleInvadeAttackerWins() public {
    setupUpdateUnitsAfterBattle();

    LibUnit.updateStoredUtilities(enemy, unit1, 100, true);
    LibUnit.updateStoredUtilities(enemy, unit2, 10, true);

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Iron)),
      enemyOriginalIron - 100,
      "Enemy should have 100 consumed iron"
    );
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper - 10,
      "Enemy should have consumed 10 copper"
    );

    LibUnit.updateStoredUtilities(player, unit1, 100, true);
    LibUnit.updateStoredUtilities(player, unit2, 50, true);

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
    assertEq(
      ResourceCount.get(player, uint8(EResource.Iron)),
      playerOriginalIron - 50,
      "Attacker should gain back 50 iron"
    );
    // diff from start to finish is 30
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper - 20,
      "Attacker should gain back 30 copper"
    );

    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, uint8(EResource.Iron)), enemyOriginalIron, "Enemy should gain back 100 iron");
    // diff from start to finish is 30
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper,
      "Enemy should gain back 10 copper"
    );
  }

  function testUpdateUnitsAfterBattleInvadeDefenderWins() public {
    setupUpdateUnitsAfterBattle();
    UnitCount.set(enemy, rock, unit1, 100);
    UnitCount.set(enemy, rock, unit2, 10);

    LibUnit.updateStoredUtilities(enemy, unit1, 100, true);
    LibUnit.updateStoredUtilities(enemy, unit2, 10, true);

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Iron)),
      enemyOriginalIron - 100,
      "Enemy should have 100 consumed iron"
    );
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper - 10,
      "Enemy should have consumed 10 copper"
    );

    LibUnit.updateStoredUtilities(player, unit1, 100, true);
    LibUnit.updateStoredUtilities(player, unit2, 50, true);

    assertEq(
      ResourceCount.get(player, uint8(EResource.Iron)),
      playerOriginalIron - 100,
      "Attacker should have 100 consumed iron"
    );
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper - 50,
      "Attacker should have consumed 50 copper"
    );

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

    assertEq(
      ResourceCount.get(player, uint8(EResource.Iron)),
      playerOriginalIron,
      "Attacker should have gained back 100 iron"
    );
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper,
      "Attacker should have gained back 50 copper"
    );

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Iron)),
      enemyOriginalIron - 70,
      "Defender should gain back 30 iron"
    );
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper - 5,
      "Defender should gain back 5 copper"
    );
  }

  function testUpdateUnitsAfterBattleRaidAttackerWins() public {
    setupUpdateUnitsAfterBattle();
    Home.setAsteroid(player, homeRock);
    UnitCount.set(enemy, rock, unit1, 100);
    LibUnit.updateStoredUtilities(enemy, unit1, 100, true);
    UnitCount.set(enemy, rock, unit2, 10);
    LibUnit.updateStoredUtilities(enemy, unit2, 10, true);

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Iron)),
      enemyOriginalIron - 100,
      "Defender should have 100 consumed iron"
    );

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper - 10,
      "Defender should have consumed 10 copper"
    );

    LibUnit.updateStoredUtilities(player, unit1, 100, true);
    LibUnit.updateStoredUtilities(player, unit2, 50, true);

    // diff from start to finish is 50
    assertEq(
      ResourceCount.get(player, uint8(EResource.Iron)),
      playerOriginalIron - 100,
      "Attacker should have 100 consumed iron"
    );
    // diff from start to finish is 30
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper - 50,
      "Attacker should have consumed 30 copper"
    );

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
    assertEq(
      ResourceCount.get(player, uint8(EResource.Iron)),
      playerOriginalIron - 50,
      "Attacker should gain back 50 iron"
    );
    // diff from start to finish is 30
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper - 20,
      "Attacker should gain back 30 copper"
    );

    // diff from start to finish is 30
    assertEq(ResourceCount.get(enemy, uint8(EResource.Iron)), enemyOriginalIron, "Enemy should gain back 100 iron");
    // diff from start to finish is 30
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper,
      "Enemy should gain back 10 copper"
    );
  }

  function testUpdateUnitsAfterBattleRaidDefenderWins() public {
    setupUpdateUnitsAfterBattle();
    Home.setAsteroid(player, homeRock);
    UnitCount.set(enemy, rock, unit1, 100);
    LibUnit.updateStoredUtilities(enemy, unit1, 100, true);
    UnitCount.set(enemy, rock, unit2, 10);
    LibUnit.updateStoredUtilities(enemy, unit2, 10, true);

    LibUnit.updateStoredUtilities(player, unit1, 100, true);
    LibUnit.updateStoredUtilities(player, unit2, 50, true);

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

    LibBattle.updateUnitsAfterBattle(br, ESendType.Raid);
    assertEq(UnitCount.get(player, homeRock, unit1), 0, "Attacker should have 0 units on home rock");
    assertEq(UnitCount.get(player, homeRock, unit2), 0, "Attacker should have 0 unit2s on home rock");
    assertEq(UnitCount.get(enemy, rock, unit1), 70, "Defender should have 70 units on rock");
    assertEq(UnitCount.get(enemy, rock, unit2), 5, "Defender should have 0 unit2s on rock");

    // both players should have their utilities removed

    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), playerOriginalIron, "Attacker should lose 50 iron");
    assertEq(
      ResourceCount.get(player, uint8(EResource.Copper)),
      playerOriginalCopper,
      "Attacker should lose 30 copper"
    );

    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Iron)),
      enemyOriginalIron - 70,
      "Defender should gain back 30 iron"
    );
    assertEq(
      ResourceCount.get(enemy, uint8(EResource.Copper)),
      enemyOriginalCopper - 5,
      "Defender should gain back 5 copper"
    );
  }

  function testUpdateProductionRatesAfterBattle() public {
    setupUpdateUnitsAfterBattle();
    Home.setAsteroid(player, homeRock);
    RockType.set(rock, uint8(ERock.Motherlode));
    Motherlode.set(rock, uint8(ESize.Large), uint8(EResource.Iron));
    P_IsUtility.set(uint8(EResource.Iron), false);
    P_MiningRate.set(unit1, 0, 1);
    ProductionRate.set(enemy, uint8(EResource.Iron), 100 + (100 * uint256(ESize.Large)));

    UnitCount.set(enemy, rock, unit1, 100);

    BattleResultData memory br = BattleResultData({
      attacker: player,
      defender: enemy,
      winner: player,
      rock: rock,
      totalCargo: 0,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 0),
      attackerUnitsLeft: getUnitArray(70, 0),
      defenderStartingUnits: getUnitArray(100, 0),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

    LibBattle.updateUnitsAfterBattle(br, ESendType.Invade);
    assertEq(ProductionRate.get(enemy, uint8(EResource.Iron)), 100, "Enemy should have 100 iron production");
    assertEq(
      ProductionRate.get(player, uint8(EResource.Iron)),
      70 * uint8(ESize.Large),
      "Player should have 210 iron production"
    );
  }
}
