// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource } from "src/Types.sol";

import { CooldownEnd, Score, P_ScoreMultiplier, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, BuildingType, Home, OwnedBy, P_EnumToPrototype, P_Transportables, P_UnitPrototypes, Asteroid, AsteroidData, Position, PositionData, Position, PositionData, ReversePosition, MaxResourceCount, UnitCount, ResourceCount, UnitCount, ResourceCount, P_GameConfig, P_GameConfigData, P_WormholeAsteroidConfig, P_WormholeAsteroidConfigData } from "codegen/index.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";
import { EUnit, EScoreType, EAllianceInviteMode } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibWormhole } from "libraries/LibWormhole.sol";

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

  function testWormholeAsteroidHasWormholeBase() public returns (bytes32) {
    bytes32 asteroidEntity = Home.get(aliceEntity);

    bytes32 wormholeAsteroidEntity = testCreateWormholeAsteroid();
    conquerAsteroid(alice, Home.get(aliceEntity), wormholeAsteroidEntity);

    assertEq(OwnedBy.get(wormholeAsteroidEntity), aliceEntity);
    assertEq(BuildingType.get(Home.get(wormholeAsteroidEntity)), WormholeBasePrototypeId);
    return wormholeAsteroidEntity;
  }

  function testDepositWormhole() public returns (bytes32) {
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);
    bytes32 asteroidEntity = Position.getParentEntity(wormholeBaseEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    vm.startPrank(creator);
    uint8 resource = LibWormhole.advanceTurn();
    uint256 resourceCount = 100;
    increaseResource(wormholeAsteroidEntity, EResource(resource), resourceCount);

    vm.prank(alice);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, resourceCount);

    assertEq(
      Score.get(aliceEntity, uint8(EScoreType.Wormhole)),
      resourceCount * P_ScoreMultiplier.get(resource),
      "score"
    );
    assertEq(CooldownEnd.get(wormholeBaseEntity), block.timestamp + wormholeConfig.cooldown, "cooldown");
    assertFalse(Wormhole.getHash() == wormholeData.hash, "hash");
    assertEq(Wormhole.getResource(), resource, "resource");
    return wormholeAsteroidEntity;
  }

  function testWormholeAllianceScore() public {
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);
    bytes32 asteroidEntity = Position.getParentEntity(wormholeBaseEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    vm.startPrank(creator);
    uint8 resource = LibWormhole.advanceTurn();

    increaseResource(wormholeAsteroidEntity, EResource(resource), 100);

    vm.startPrank(alice);
    bytes32 allianceEntity = world.Primodium__create(bytes32("alice's alliance"), EAllianceInviteMode.Open);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, 100);

    assertEq(Score.get(allianceEntity, uint8(EScoreType.Wormhole)), 100 * P_ScoreMultiplier.get(resource), "score");
    assertEq(Score.get(allianceEntity, uint8(EScoreType.Primodium)), 0, "score");
  }

  function testDepositWormholeScoreAfterGameOver() public returns (bytes32) {
    uint256 deaths = 4;
    vm.prank(creator);
    P_GameConfig.setUnitDeathLimit(deaths);
    bytes32 fleetEntity = spawnFleetWithUnit(Home.get(addressToEntity(creator)), EUnit.MinutemanMarine, deaths);

    vm.prank(creator);
    world.Primodium__abandonFleet(fleetEntity);

    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);
    bytes32 asteroidEntity = Position.getParentEntity(wormholeBaseEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    uint8 resource = LibWormhole.advanceTurn();
    uint256 resourceCount = 100;
    increaseResource(wormholeAsteroidEntity, EResource(resource), resourceCount);

    switchPrank(alice);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, resourceCount);

    assertEq(Score.get(aliceEntity, uint8(EScoreType.Wormhole)), 0, "don't allow score after game end");
  }
  function testDepositWormholeAfterCooldown() public returns (bytes32) {
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);
    bytes32 asteroidEntity = Position.getParentEntity(wormholeBaseEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    vm.startPrank(creator);
    uint8 resource = LibWormhole.advanceTurn();

    increaseResource(wormholeAsteroidEntity, EResource(resource), 100);

    vm.prank(alice);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, 100);

    vm.warp(CooldownEnd.get(wormholeBaseEntity) + 1);

    vm.startPrank(creator);
    resource = LibWormhole.advanceTurn();
    vm.stopPrank();

    increaseResource(wormholeAsteroidEntity, EResource(resource), 100);

    uint256 prevScore = Score.get(aliceEntity, uint8(EScoreType.Wormhole));

    vm.prank(alice);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, 100);

    assertEq(
      Score.get(aliceEntity, uint8(EScoreType.Wormhole)),
      100 * P_ScoreMultiplier.get(resource) + prevScore,
      "score"
    );
    assertEq(CooldownEnd.get(wormholeBaseEntity), block.timestamp + wormholeConfig.cooldown, "cooldown");
    assertFalse(Wormhole.getHash() == wormholeData.hash, "hash");
    assertEq(Wormhole.getResource(), resource, "resource");
    return wormholeAsteroidEntity;
  }

  function testDepositWormholeFailNotEnoughResources() public {
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);
    bytes32 asteroidEntity = Position.getParentEntity(wormholeBaseEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    increaseResource(wormholeAsteroidEntity, EResource(wormholeData.resource), 99);

    vm.startPrank(alice);
    vm.expectRevert("[StorageUsage] not enough resources to decrease");
    world.Primodium__wormholeDeposit(wormholeBaseEntity, 100);
  }

  function testDepositWormholeFailNotWormholeBase() public {
    WormholeData memory wormholeData = Wormhole.get();
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    increaseResource(wormholeAsteroidEntity, EResource(wormholeData.resource), 100);
    vm.startPrank(alice);
    vm.expectRevert("[WormholeDeposit] Building is not a wormhole generator");
    world.Primodium__wormholeDeposit(wormholeAsteroidEntity, 100);
  }
  function testDepositWormholeFailInCooldown() public {
    WormholeData memory wormholeData = Wormhole.get();
    bytes32 wormholeAsteroidEntity = testDepositWormhole();
    bytes32 wormholeEntity = Home.get(wormholeAsteroidEntity);
    increaseResource(wormholeAsteroidEntity, EResource(wormholeData.resource), 100);
    vm.startPrank(alice);
    vm.expectRevert("[WormholeDeposit] Wormhole in cooldown");
    world.Primodium__wormholeDeposit((wormholeEntity), 100);
  }

  function testDepositWormholeFailOnlyOwner() public {
    WormholeData memory wormholeData = Wormhole.get();
    bytes32 wormholeAsteroidEntity = testWormholeAsteroidHasWormholeBase();
    bytes32 wormholeEntity = Home.get(wormholeAsteroidEntity);
    increaseResource(wormholeAsteroidEntity, EResource(wormholeData.resource), 100);

    vm.startPrank(bob);
    vm.expectRevert("[WormholeDeposit] Only owner can deposit");
    world.Primodium__wormholeDeposit(wormholeEntity, 100);
  }

  function getTurnStartTimestamp(uint256 turn) private returns (uint256) {
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();
    return wormholeConfig.initTime + (turn * wormholeConfig.turnDuration);
  }

  function testUpdateWormholeResource() public {
    bytes32 wormholeAsteroidEntity = testDepositWormhole();
    bytes32 wormholeBaseEntity = Home.get(wormholeAsteroidEntity);

    WormholeData memory wormholeData = Wormhole.get();
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    vm.warp(LibMath.max(CooldownEnd.get((wormholeBaseEntity)), getTurnStartTimestamp(wormholeData.turn + 1) + 1));

    bytes32 wormholeHash = Wormhole.getHash();
    uint8 expectedNewResource = Wormhole.getNextResource();

    uint8 expectedNewNextResource = LibWormhole.getRandomResource(
      wormholeHash,
      wormholeData.turn + 1,
      wormholeData.nextResource
    );

    uint256 prevScore = Score.get(aliceEntity, uint8(EScoreType.Wormhole));

    increaseResource(wormholeAsteroidEntity, EResource(expectedNewResource), 100);

    vm.startPrank(alice);
    world.Primodium__wormholeDeposit(wormholeBaseEntity, 100);

    assertEq(
      Score.get(aliceEntity, uint8(EScoreType.Wormhole)),
      100 * P_ScoreMultiplier.get(expectedNewResource) + prevScore,
      "score"
    );
    assertEq(CooldownEnd.get(wormholeBaseEntity), block.timestamp + wormholeConfig.cooldown, "cooldown");
    assertFalse(Wormhole.getHash() == wormholeData.hash, "hash");
    assertTrue(Wormhole.getResource() == expectedNewResource, "resource");
    assertTrue(Wormhole.getNextResource() == expectedNewNextResource, "next resource");
    assertEq(Wormhole.getTurn(), wormholeData.turn + 1, "turn");
  }

  function testRandomResourceSanityCheck() public {
    bytes32 seed = bytes32("hello");
    uint8 prevResource = 1;
    uint256 turn = 1;
    uint256 resource;
    do {
      seed = keccak256(abi.encode(seed, turn));
      console.logBytes32(seed);
      resource = uint8(uint256(seed) % P_Transportables.length());
    } while (resource == prevResource);

    assertTrue(resource != prevResource, "resource should not be the same as prevResource");
    console.log("resource:", resource);
  }
}
