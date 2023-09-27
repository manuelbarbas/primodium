// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "../PrimodiumTest.t.sol";

contract LibMotherlodeTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();

    P_GameConfigData memory gameConfig = P_GameConfig.get();
    gameConfig.motherlodeDistance = 8;
    gameConfig.maxMotherlodesPerAsteroid = 12;
    gameConfig.motherlodeChanceInv = 2;
    vm.startPrank(creator);
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
    (uint8 size, uint8 motherlodeType) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
  }

  function findMotherlode() public returns (bytes32, PositionData memory) {
    P_GameConfigData memory config = P_GameConfig.get(world);
    address player = alice;
    bytes32 asteroid = spawn(player);
    PositionData memory sourcePosition = getHomeAsteroidPosition(player);
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
      logPosition(sourcePosition);
      targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      logPosition(targetPosition);

      motherlodeSeed = keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      i++;
    }
    require(found, "uh oh, no motherlode found");
    return (asteroid, targetPosition);
  }

  function testCreateMotherlode() public {
    (bytes32 asteroid, PositionData memory position) = findMotherlode();
    vm.startPrank(creator);
    LibMotherlode.createMotherlode(position);
    bytes32 motherlodeEntity = keccak256(abi.encode(asteroid, "motherlode", position.x, position.y));
    (uint8 size, uint8 motherlodeType) = LibMotherlode.getMotherlodeRawPrototype(motherlodeEntity);

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
  }

  function testFailNoMotherlodeNoSource() public {
    LibMotherlode.createMotherlode(PositionData(0, 0, 0));
  }
}
