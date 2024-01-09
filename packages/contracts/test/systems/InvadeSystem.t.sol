pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract InvadeSystemTest is PrimodiumTest {
  bytes32 rock = "rock";
  bytes32 homeRock = "homeRock";
  bytes32 unit1 = "unit1";

  PositionData originPosition = PositionData(0, 0, 0);
  PositionData destinationPosition = PositionData(0, 10, 0);

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
    P_UnitPrototypes.set(unitTypes);
    ReversePosition.set(originPosition.x, originPosition.y, homeRock);
    Position.set(homeRock, originPosition);
    Position.set(rock, destinationPosition);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, rock);

    vm.stopPrank();
  }

  function setupUnit(
    bytes32 unit,
    uint256 attack,
    uint256 defense
  ) internal {
    P_Unit.set(unit, 0, P_UnitData({ attack: attack, defense: defense, speed: 0, cargo: 0, trainingTime: 0 }));
  }

  function testAliceAttack() public {
    vm.startPrank(creator);
    bytes32 player = addressToEntity(alice);
    bytes32 enemy = addressToEntity(bob);
    ResourceCount.set(enemy, uint8(EResource.Iron), 100);
    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    Home.setAsteroid(player, homeRock);
    OwnedBy.set(rock, enemy);

    Asteroid.setIsAsteroid(rock, true);
    Asteroid.setIsAsteroid(homeRock, true);
    UnitCount.set(enemy, rock, unit1, 100);
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

    switchPrank(alice);

    world.invade(rock);
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "Player Iron");
    assertEq(UnitCount.get(player, rock, unit1), 100, "Player units");
    assertEq(UnitCount.get(enemy, rock, unit1), 0, "Enemy units");
    assertEq(ResourceCount.get(enemy, uint8(EResource.Iron)), 100, "Enemy Iron");
    assertEq(OwnedBy.get(rock), player, "OwnedBy");
  }
}
