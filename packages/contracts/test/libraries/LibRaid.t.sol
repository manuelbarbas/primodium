// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibRaidTest is PrimodiumTest {
  bytes32 player;
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 rock = "rock";
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
    br.attacker = player;
    br.winner = player;
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
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
    ResourceCount.set(enemy, Iron, 100);
    ResourceCount.set(enemy, Copper, 200);
    ResourceCount.set(enemy, Platinum, 500);

    br.totalCargo = 0;
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);

    for (uint256 i = 0; i < raidResult.raidedAmount.length; i++) {
      assertEq(raidResult.raidedAmount[i], 0);
      assertEq(raidResult.defenderValuesBeforeRaid[i], 0);
    }
  }

  function testResolveRaid() public {
    MaxResourceCount.set(player, Iron, 1000);
    MaxResourceCount.set(player, Copper, 1000);
    ResourceCount.set(enemy, Iron, 100);
    ResourceCount.set(enemy, Copper, 200);
    P_IsUtility.set(Platinum, true);
    ResourceCount.set(enemy, Platinum, 500);
    LibResource.claimAllResources(player);
    LibResource.claimAllResources(enemy);
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    LibResource.claimAllResources(player);
    LibResource.claimAllResources(enemy);

    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Iron)], 100);
    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Copper)], 200);
    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Platinum)], 0);

    uint256 total = 300;

    assertEq(raidResult.raidedAmount[uint256(Iron)], (br.totalCargo * 100) / total, "Iron raided amount");
    assertEq(raidResult.raidedAmount[uint256(Copper)], (br.totalCargo * 200) / total, "Copper raided amount");
    assertEq(raidResult.raidedAmount[uint256(Platinum)], 0, "Platinum raided amount");

    assertEq(ResourceCount.get(player, Iron), raidResult.raidedAmount[uint256(Iron)], "Player Iron");
    assertEq(ResourceCount.get(player, Copper), raidResult.raidedAmount[uint256(Copper)], "Player Copper");
    assertEq(ResourceCount.get(player, Platinum), raidResult.raidedAmount[uint256(Platinum)], "Player Platinum");

    assertEq(
      ResourceCount.get(enemy, Iron),
      raidResult.defenderValuesBeforeRaid[uint256(Iron)] - raidResult.raidedAmount[uint256(Iron)],
      "Enemy Iron"
    );
    assertEq(
      ResourceCount.get(enemy, Copper),
      raidResult.defenderValuesBeforeRaid[uint256(Copper)] - raidResult.raidedAmount[uint256(Copper)],
      "Enemy Copper"
    );
    assertEq(ResourceCount.get(enemy, Platinum), 500, "Enemy Platinum");
  }

  function testResolveRaidOverflow() public {
    MaxResourceCount.set(player, Iron, 1000);
    ResourceCount.set(enemy, Iron, 10);

    br.totalCargo = 10;
    LibResource.claimAllResources(player);
    LibResource.claimAllResources(enemy);
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    LibResource.claimAllResources(player);
    LibResource.claimAllResources(enemy);

    assertEq(raidResult.defenderValuesBeforeRaid[uint256(Iron)], 10);
    assertEq(raidResult.raidedAmount[uint256(Iron)], 10, "Iron raided amount");
    assertEq(ResourceCount.get(player, Iron), raidResult.raidedAmount[uint256(Iron)], "Player Iron");
  }

  function testRaid() public {
    ResourceCount.set(enemy, Iron, 100);
    MaxResourceCount.set(player, Iron, 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    RockType.set(rock, uint8(ERock.Asteroid));
    RockType.set(homeRock, uint8(ERock.Asteroid));
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
      unitCounts: [uint256(200), 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.raid(rock);

    assertEq(ResourceCount.get(player, Iron), 100, "Player Iron");
    assertEq(UnitCount.get(player, homeRock, unit1), 100, "Player units");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(enemy, Iron), 0, "Enemy Iron");
  }

  function testRaidVault() public {
    ResourceCount.set(enemy, Iron, 100);
    MaxResourceCount.set(player, Iron, 100);
    TotalVault.set(enemy, Iron, 100);
    Home.setAsteroid(enemy, rock);
    OwnedBy.set(rock, enemy);
    RockType.set(rock, uint8(ERock.Asteroid));
    RockType.set(homeRock, uint8(ERock.Asteroid));
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
      unitCounts: [uint256(200), 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.raid(rock);

    assertEq(ResourceCount.get(player, Iron), 0, "Player Iron");
    assertEq(UnitCount.get(player, homeRock, unit1), 100, "Player units");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(enemy, Iron), 100, "Enemy Iron");
  }

  function testFailRaidMotherlode() public {
    RockType.set(rock, uint8(ERock.Motherlode));
    world.raid(rock);
  }

  function testFailRaidUnowned() public {
    RockType.set(rock, uint8(ERock.Asteroid));
    world.raid(rock);
  }

  function testFailRaidSelfOwned() public {
    RockType.set(rock, uint8(ERock.Asteroid));
    OwnedBy.set(rock, player);
    world.raid(rock);
  }
}
