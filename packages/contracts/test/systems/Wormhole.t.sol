// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource } from "src/Types.sol";

import { BuildingType, Home, OwnedBy, P_EnumToPrototype, P_Transportables, P_UnitPrototypes, Asteroid, AsteroidData, Position, PositionData, Position, PositionData, ReversePosition, MaxResourceCount, UnitCount, ResourceCount, UnitCount, ResourceCount, P_GameConfig, P_GameConfigData, P_WormholeAsteroidConfig, P_WormholeAsteroidConfigData } from "codegen/index.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";
import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";

contract WormholeTest is PrimodiumTest {
  bytes32 aliceEntity;
  function setUp() public override {
    super.setUp();
    spawn(creator);
    aliceEntity = addressToEntity(alice);
  }

  function testCreateWormholeAsteroid() public returns (bytes32) {
    bytes32 asteroidEntity = spawn(alice);
    PositionData memory position = findWormholeAsteroid(asteroidEntity);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    uint256[] memory resourceCounts = new uint256[](P_Transportables.length());
    bytes32 minutemanEntity = P_EnumToPrototype.get(UnitKey, uint8(EUnit.MinutemanMarine));
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (unitPrototypes[i] == minutemanEntity) unitCounts[i] = 1;
    }

    setupCreateFleet(alice, asteroidEntity, unitCounts, resourceCounts);
    vm.startPrank(alice);

    bytes32 fleetEntity = world.Primodium__createFleet(asteroidEntity, unitCounts, resourceCounts);
    world.Primodium__sendFleet(fleetEntity, position);

    bytes32 actualAsteroidEntity = ReversePosition.get(position.x, position.y);
    bytes32 expectedAsteroidEntity = keccak256(abi.encode(asteroidEntity, bytes32("asteroid"), position.x, position.y));

    assertEq(actualAsteroidEntity, expectedAsteroidEntity, "asteroidEntity");
    AsteroidData memory expectedAsteroidData = LibAsteroid.getAsteroidData(expectedAsteroidEntity, false, true);
    AsteroidData memory actualAsteroidData = Asteroid.get(expectedAsteroidEntity);

    assertEq(expectedAsteroidData.isAsteroid, actualAsteroidData.isAsteroid, "isAsteroid");
    assertEq(expectedAsteroidData.spawnsSecondary, actualAsteroidData.spawnsSecondary, "spawnsSecondary");
    assertEq(expectedAsteroidData.mapId, actualAsteroidData.mapId, "mapId");
    assertTrue(actualAsteroidData.wormhole, "wormhole");
    assertEq(Position.get(actualAsteroidEntity), position);
    assertEq(ReversePosition.get(position.x, position.y), actualAsteroidEntity, "reversePosition");
    assertEq(
      MaxResourceCount.get(actualAsteroidEntity, uint8(EResource.U_MaxFleets)),
      0,
      "Asteroid should have 0 max fleets"
    );
    return actualAsteroidEntity;
  }

  function testWormholeAsteroidHasWormholeBase() public {
    bytes32 asteroidEntity = Home.get(aliceEntity);

    bytes32 wormholeAsteroidEntity = testCreateWormholeAsteroid();
    conquerAsteroid(alice, Home.get(aliceEntity), wormholeAsteroidEntity);

    assertEq(OwnedBy.get(wormholeAsteroidEntity), aliceEntity);
    assertEq(BuildingType.get(Home.get(wormholeAsteroidEntity)), WormholeBasePrototypeId);
  }
}
