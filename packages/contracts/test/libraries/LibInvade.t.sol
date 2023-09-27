// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract LibInvadeTest is PrimodiumTest {
  bytes32 player;
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 homeRock = "homeRock";
  bytes32 rock = "rock";

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
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
    br.attacker = player;
    bytes32[] memory unitTypes = new bytes32[](unitPrototypeCount);
    unitTypes[0] = unit1;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
  }

  function testInvadeNeutral() public {
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 100, 0, 0, 0]
    });
    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    LibInvade.invadeNeutral(world, player, rock);
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
    assertEq(UnitCount.get(player, rock, unit1), 200, "Unit1 Count");
    assertEq(UnitCount.get(player, rock, unit2), 100, "Unit2 Count");
  }

  function testInvadeAttackerWins() public {
    ResourceCount.set(enemy, EResource.Iron, 100);
    MaxResourceCount.set(player, EResource.Iron, 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    RockType.set(rock, ERock.Motherlode);
    RockType.set(homeRock, ERock.Asteroid);
    UnitCount.set(enemy, rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    LibInvade.invade(world, player, rock);

    assertEq(ResourceCount.get(player, EResource.Iron), 0, "Player Iron");
    assertEq(UnitCount.get(player, rock, unit1), 100, "Player units");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(enemy, EResource.Iron), 100, "Enemy Iron");
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
  }

  function testInvadeDefenderWins() public {
    ResourceCount.set(enemy, EResource.Iron, 100);
    MaxResourceCount.set(player, EResource.Iron, 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    RockType.set(rock, ERock.Motherlode);
    RockType.set(homeRock, ERock.Asteroid);
    UnitCount.set(enemy, rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(50), 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    LibInvade.invade(world, player, rock);

    assertEq(ResourceCount.get(player, EResource.Iron), 0, "Player Iron");
    assertEq(UnitCount.get(player, rock, unit1), 0, "Player units");
    assertEq(UnitCount.get(enemy, rock, unit1), 50, "Enemy units");
    assertEq(ResourceCount.get(enemy, EResource.Iron), 100, "Enemy Iron");
    assertEq(OwnedBy.get(rock), enemy, "OwnedBy");
  }

  function testFailInvadeAsteroid() public {
    RockType.set(rock, ERock.Asteroid);
    LibRaid.raid(world, player, rock);
  }

  function testFailInvadeUnowned() public {
    RockType.set(rock, ERock.Motherlode);
    LibRaid.raid(world, player, rock);
  }

  function testFailInvadeSelfOwned() public {
    RockType.set(rock, ERock.Motherlode);
    OwnedBy.set(rock, player);
    LibRaid.raid(world, player, rock);
  }
}
