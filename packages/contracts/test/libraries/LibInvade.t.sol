// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { Systems } from "@latticexyz/world/src/codegen/tables/Systems.sol";

contract LibInvadeTest is PrimodiumTest {
  bytes32 player;
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 homeRock = "homeRock";
  bytes32 rock = "rock";

  uint256[NUM_UNITS] unitCounts;

  PositionData originPosition = PositionData(0, 0, 0);
  PositionData destinationPosition = PositionData(0, 10, 0);
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
    br.attacker = player;
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
    ReversePosition.set(originPosition.x, originPosition.y, homeRock);
    Position.set(homeRock, originPosition);
    Position.set(rock, destinationPosition);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, rock);
  }

  function testInvadeNeutral() public {
    vm.warp(1000);
    RockType.set(rock, uint8(ERock.Motherlode));

    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(200), 100, 0, 0, 0, 0, 0, 0]
    });
    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(player, 1);

    world.invade(rock);
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
    assertEq(UnitCount.get(rock, unit1), 200, "Unit1 Count");
    assertEq(UnitCount.get(rock, unit2), 100, "Unit2 Count");
  }

  function testInvadeNeutralNoAttackPoints() public {
    vm.warp(1000);
    RockType.set(rock, uint8(ERock.Motherlode));

    vm.expectRevert("[Invade] Can not invade with 0 attack points");
    world.invade(rock);
  }

  function testInvadeNeutralWithUnitSend() public {
    OwnedBy.set(homeRock, player);
    ResourceCount.set(homeRock, U_MaxMoves, 10);
    RockType.set(homeRock, uint8(ERock.Asteroid));
    RockType.set(rock, uint8(ERock.Motherlode));

    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    UnitCount.set(homeRock, unit1, 100);

    unitCounts[0] = 10;

    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, bytes32(""));
    uint256 distance = LibMath.distance(originPosition, destinationPosition);
    uint256 travelTime = (distance * P_GameConfig.getTravelTime() * WORLD_SPEED_SCALE * UNIT_SPEED_SCALE) /
      (P_GameConfig.getWorldSpeed() * P_Unit.getSpeed(unit1, 0));
    vm.warp(block.timestamp + travelTime);

    world.invade(rock);
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
    assertEq(UnitCount.get(rock, unit1), 10, "Unit1 Count");
  }

  function testInvadeAttackerWins() public {
    ResourceCount.set(enemy, uint8(EResource.Iron), 100);
    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    OwnedMotherlodes.push(enemy, rock);

    RockType.set(rock, uint8(ERock.Motherlode));
    RockType.set(homeRock, uint8(ERock.Asteroid));
    UnitCount.set(rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Invade,
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

    world.invade(rock);

    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "Player Iron");
    assertEq(UnitCount.get(rock, unit1), 100, "Player units");
    assertEq(ResourceCount.get(enemy, uint8(EResource.Iron)), 100, "Enemy Iron");
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
    assertEq(OwnedMotherlodes.length(enemy), 0, "OwnedMotherlodes for enemy should be 0");
    assertEq(OwnedMotherlodes.length(player), 1, "OwnedMotherlodes for player should be 1");
  }

  function testInvadeDefenderWins() public {
    ResourceCount.set(enemy, uint8(EResource.Iron), 100);
    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);
    RockType.set(rock, uint8(ERock.Motherlode));
    RockType.set(homeRock, uint8(ERock.Asteroid));
    UnitCount.set(rock, unit1, 100);
    vm.warp(1000);
    Arrival memory arrival = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: player,
      to: enemy,
      origin: homeRock,
      destination: rock,
      unitCounts: [uint256(50), 0, 0, 0, 0, 0, 0, 0]
    });

    ArrivalsMap.set(player, rock, keccak256(abi.encode(arrival)), arrival);
    ArrivalCount.set(player, 1);
    P_Unit.set(unit1, 0, P_UnitData({ attack: 100, defense: 100, speed: 200, cargo: 100, trainingTime: 0 }));

    world.invade(rock);

    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "Player Iron");
    assertEq(UnitCount.get(rock, unit1), 50, "Enemy units");
    assertEq(ResourceCount.get(enemy, uint8(EResource.Iron)), 100, "Enemy Iron");
    assertEq(OwnedBy.get(rock), enemy, "OwnedBy");
  }

  function testInvadeAsteroid() public {
    RockType.set(rock, uint8(ERock.Asteroid));
    vm.expectRevert("[Invade] Can only invade motherlodes");
    world.invade(rock);
  }

  function testInvadeSelfOwned() public {
    RockType.set(rock, uint8(ERock.Motherlode));
    OwnedBy.set(rock, player);
    vm.expectRevert("[Invade] can not invade your own rock");
    world.invade(rock);
  }
}
