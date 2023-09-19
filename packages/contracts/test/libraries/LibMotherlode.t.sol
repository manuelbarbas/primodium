// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

contract LibMotherlodeTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();

    P_GameConfigData memory gameConfig = P_GameConfigData({
      motherlodeDistance: 8,
      maxMotherlodesPerAsteroid: 12,
      motherlodeChanceInv: 2
    });
    vm.startPrank(worldAddress);
    P_GameConfig.set(world, gameConfig);
    vm.stopPrank();
  }

  function testIsMotherlode() public {
    uint256 chanceInv = P_GameConfig.get(world).motherlodeChanceInv;
    bytes32 entity = 0 << 128;
    assertFalse(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = bytes32(uint256(1 << 128));
    assertTrue(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = bytes32(uint256(2 << 128));
    assertTrue(!LibMotherlode.isMotherlode(entity, chanceInv));
  }

  function testFuzzMotherlodePrototype(bytes32 entity) public {
    (uint8 size, uint8 motherlodeType, uint256 cooldownSeconds) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
    assertLt(cooldownSeconds, 64);
  }

  function findMotherlode() public returns (bytes32, PositionData memory) {
    P_GameConfigData memory config = P_GameConfig.get(world);
    console.log("distance:", config.motherlodeDistance);
    address player = alice;
    bytes32 asteroid = spawn(player);
    console.log("asteroid:", uint256(asteroid));
    PositionData memory sourcePosition = getHomeAsteroidPosition(player);
    console.log("position");
    logPosition(sourcePosition);
    bytes32 motherlodeSeed;
    PositionData memory targetPosition;
    uint256 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      PositionData memory targetPositionRelative = LibMotherlode.getPosition(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      console.log("trying position");
      logPosition(sourcePosition);
      targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      console.log("trying position");
      logPosition(targetPosition);

      motherlodeSeed = keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      console.log("found:", found);
      i++;
    }
    require(found, "uh oh, no motherlode found");
    return (asteroid, targetPosition);
  }

  function testCreateMotherlode() public {
    (bytes32 asteroid, PositionData memory position) = findMotherlode();
    vm.startPrank(worldAddress);
    LibMotherlode.createMotherlode(position);
    bytes32 motherlodeEntity = keccak256(abi.encode(asteroid, "motherlode", position.x, position.y));
    (uint8 size, uint8 motherlodeType, uint256 cooldownSeconds) = LibMotherlode.getMotherlodeRawPrototype(
      motherlodeEntity
    );

    assertEq(Position.get(motherlodeEntity), position);
    assertEq(LastClaimedAt.get(motherlodeEntity), block.timestamp, "lastClaimedAt");
    assertEq(uint8(RockType.get(motherlodeEntity)), uint8(ERock.Motherlode), "rockType");
    assertEq(ReversePosition.get(position.x, position.y), motherlodeEntity, "reversePosition");

    MotherlodeData memory motherlode = Motherlode.get(motherlodeEntity);
    assertEq(uint256(motherlode.size), uint256(LibMotherlode.getSize(size)), "size");
    assertEq(
      uint256(motherlode.motherlodeType),
      uint256(LibMotherlode.getMotherlodeType(motherlodeType)),
      "motherlodeType"
    );
    assertEq(motherlode.cooldownSeconds, cooldownSeconds, "cooldownSeconds");
  }

  function testFailNoMotherlodeNoSource() public {
    LibMotherlode.createMotherlode(PositionData(0, 0, 0));
  }

  /* ------------------------------ Sanity checks ----------------------------- */
  function testPrintMotherlodeEntities() public view {
    for (uint32 i = 0; i < 10; i++) {
      PositionData memory position = PositionData(int32(i) * 7, int32(i) * 11, 0);
      uint256 motherlodeEntity = uint256(keccak256(abi.encode(uint256(i), "motherlode", position.x, position.y)));
      logPosition(position);
      console.log("i:", i);
      console.log("motherlodeEntity: ", motherlodeEntity);
    }
  }

  function testPrintAsteroidMotherlodes() public {
    P_GameConfigData memory config = P_GameConfigData({
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 4
    });

    address player = alice;
    spawn(player);
    uint256 asteroid = 0xe19384268f063f61ad35763c513b0e482cc607fb876a26a511ae588042cfa35b;
    PositionData memory sourcePosition = PositionData(-16, 28, 0);
    for (uint256 i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
      console.log("ANGLE: ", (i * 360) / config.maxMotherlodesPerAsteroid);
      PositionData memory targetPositionRelative = LibMotherlode.getPosition(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      PositionData memory targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      bytes32 motherlodeSeed = keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y));
      bool found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      if (found) {
        console.log("motherlode found: ");
      }
      logPosition(targetPosition);
      console.log(" ");
    }
  }
}
