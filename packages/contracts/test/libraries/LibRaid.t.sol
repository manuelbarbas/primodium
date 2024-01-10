// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibRaidTest is PrimodiumTest {
  bytes32 player;
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 rock = "rock";
  bytes32 rock2 = "rock2";
  bytes32 rock3 = "rock3";
  bytes32 homeRock = "homeRock";

  BattleResultData br =
    BattleResultData({
      attacker: player,
      defender: enemy,
      winner: player,
      rock: rock,
      totalCargo: 100,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      defenderStartingUnits: getUnitArray(100, 10),
      attackerUnitsLeft: getUnitArray(50, 20),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    Home.setAsteroid(player, homeRock);
    Home.setAsteroid(enemy, rock);
    br.attacker = player;
    br.winner = player;
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
  }

  function testResolveRaidNoResources() public {
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);

    for (uint256 i = 0; i < raidResult.raidedAmount.length; i++) {
      assertEq(raidResult.raidedAmount[i], 0);
      assertEq(raidResult.defenderValuesBeforeRaid[i], 0);
    }
  }

  function testResolveRaidNoCargo() public {
    ResourceCount.set(rock, Iron, 100);
    ResourceCount.set(rock, Copper, 200);
    ResourceCount.set(rock, Platinum, 500);

    br.totalCargo = 0;
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);

    for (uint256 i = 0; i < raidResult.raidedAmount.length; i++) {
      assertEq(raidResult.raidedAmount[i], 0);
      assertEq(raidResult.defenderValuesBeforeRaid[i], 0);
    }
  }

  function testResolveRaid() public {
    MaxResourceCount.set(homeRock, Iron, 1000);
    MaxResourceCount.set(homeRock, Copper, 1000);
    ResourceCount.set(rock, Iron, 100);
    ResourceCount.set(rock, Copper, 200);
    P_IsUtility.set(Platinum, true);
    ResourceCount.set(rock, Platinum, 500);
    LibResource.claimAllResources(homeRock);
    LibResource.claimAllResources(rock);
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    LibResource.claimAllResources(homeRock);
    LibResource.claimAllResources(rock);

    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Iron)], 100);
    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Copper)], 200);
    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Platinum)], 0);

    uint256 total = 300;

    assertEq(raidResult.raidedAmount[uint256(Iron)], (br.totalCargo * 100) / total, "Iron raided amount");
    assertEq(raidResult.raidedAmount[uint256(Copper)], (br.totalCargo * 200) / total, "Copper raided amount");
    assertEq(raidResult.raidedAmount[uint256(Platinum)], 0, "Platinum raided amount");

    assertEq(ResourceCount.get(homeRock, Iron), raidResult.raidedAmount[uint256(Iron)], "Player Iron");
    assertEq(ResourceCount.get(homeRock, Copper), raidResult.raidedAmount[uint256(Copper)], "Player Copper");
    assertEq(ResourceCount.get(homeRock, Platinum), raidResult.raidedAmount[uint256(Platinum)], "Player Platinum");

    assertEq(
      ResourceCount.get(rock, Iron),
      raidResult.defenderValuesBeforeRaid[uint256(Iron)] - raidResult.raidedAmount[uint256(Iron)],
      "Enemy Iron"
    );
    assertEq(
      ResourceCount.get(rock, Copper),
      raidResult.defenderValuesBeforeRaid[uint256(Copper)] - raidResult.raidedAmount[uint256(Copper)],
      "Enemy Copper"
    );
    assertEq(ResourceCount.get(rock, Platinum), 500, "Enemy Platinum");
  }

  function testResolveRaidOverflow() public {
    MaxResourceCount.set(homeRock, Iron, 1000);
    ResourceCount.set(rock, Iron, 10);

    br.totalCargo = 10;
    LibResource.claimAllResources(homeRock);
    LibResource.claimAllResources(rock);
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    LibResource.claimAllResources(homeRock);
    LibResource.claimAllResources(rock);

    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Iron)], 10);
    assertEq(raidResult.raidedAmount[uint256(Iron)], 10, "Iron raided amount");
    assertEq(ResourceCount.get(homeRock, Iron), raidResult.raidedAmount[uint256(Iron)], "Player Iron");
  }

  function testRaid() public {
    ResourceCount.set(rock, Iron, 100);
    MaxResourceCount.set(homeRock, Iron, 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    Asteroid.setIsAsteroid(rock, true);
    Asteroid.setIsAsteroid(homeRock, true);
    UnitCount.set(rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Raid,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 0, 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(player, 1);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.raid(rock);

    assertEq(ResourceCount.get(homeRock, Iron), 100, "Player Iron");
    assertEq(UnitCount.get(homeRock, unit1), 100, "Player units");
    assertEq(UnitCount.get(rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(rock, Iron), 0, "Enemy Iron");
  }

  function testRaidVault() public {
    ResourceCount.set(rock, Iron, 100);
    MaxResourceCount.set(homeRock, Iron, 100);
    ResourceCount.set(rock, uint8(EResource.U_Unraidable), 100);
    Home.setAsteroid(enemy, rock);
    OwnedBy.set(rock, enemy);
    Asteroid.setIsAsteroid(rock, true);
    Asteroid.setIsAsteroid(homeRock, true);
    UnitCount.set(rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Raid,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 0, 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(player, 1);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.raid(rock);

    assertEq(ResourceCount.get(homeRock, Iron), 0, "Player Iron");
    assertEq(UnitCount.get(homeRock, unit1), 100, "Player units");
    assertEq(UnitCount.get(rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(rock, Iron), 100, "Enemy Iron");
  }

  function testRaidAdvancedVault() public {
    ResourceCount.set(rock, Iron, 100);
    MaxResourceCount.set(homeRock, Iron, 100);
    ResourceCount.set(rock, uint8(EResource.U_AdvancedUnraidable), 100);
    P_IsAdvancedResource.set(Iron, true);
    Home.setAsteroid(enemy, rock);
    OwnedBy.set(rock, enemy);
    Asteroid.setIsAsteroid(rock, true);
    Asteroid.setIsAsteroid(homeRock, true);
    UnitCount.set(enemy, rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Raid,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 0, 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(player, 1);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.raid(rock);

    assertEq(ResourceCount.get(homeRock, Iron), 0, "Player Iron");
    assertEq(UnitCount.get(homeRock, unit1), 100, "Player units");
    assertEq(UnitCount.get(rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(rock, Iron), 100, "Enemy Iron");
  }

  function testFailRaidUnowned() public {
    Asteroid.setIsAsteroid(rock, true);
    world.raid(rock);
  }

  function testFailRaidSelfOwned() public {
    Asteroid.setIsAsteroid(rock, true);
    OwnedBy.set(rock, player);
    world.raid(rock);
  }

  function testRaidArrivalCount() public {
    MaxResourceCount.set(homeRock, uint8(EResource.U_Vessel), 2);
    Asteroid.setIsAsteroid(rock, true);

    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Invade,
      arrivalTime: block.timestamp,
      from: player,
      to: bytes32(""),
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 100, 0, 0, 0, 0, 0, 0]
    });
    LibSend.sendUnits(arrival);

    vm.warp(block.timestamp + 1);
    assertEq(ArrivalCount.get(player), 1);

    world.invade(rock);
    assertEq(ArrivalCount.get(player), 0);

    assertEq(OwnedBy.get(rock), player, "OwnedBy");
    assertEq(UnitCount.get(rock, unit1), 200, "Unit1 Count");
    assertEq(UnitCount.get(rock, unit2), 100, "Unit2 Count");

    vm.stopPrank();
    rock2 = spawn(bob);
    arrival.sendType = ESendType.Raid;
    arrival.to = addressToEntity(bob);
    arrival.destination = rock2;

    vm.startPrank(creator);
    LibSend.sendUnits(arrival);

    assertEq(ArrivalCount.get(player), 1, "ArrivalCount 1");

    arrival.sendType = ESendType.Reinforce;
    arrival.to = player;
    arrival.destination = rock;

    LibSend.sendUnits(arrival);

    assertEq(ArrivalCount.get(player), 2, "ArrivalCount 2");

    world.raid(rock2);
    assertEq(ArrivalCount.get(player), 1, "ARrival count 3");
  }
}
