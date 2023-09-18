// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

contract LibMotherlodeTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();

    P_GameConfigData memory gameConfig = P_GameConfig({
      moveSpeed: 100,
      motherlodeDistance: 8,
      maxMotherlodesPerAsteroid: 12,
      motherlodeChanceInv: 2
    });
    vm.prank(deployer);
    gameConfig.set(SingletonID, gameConfig);
  }

  function testIsMotherlode() public {
    uint32 chanceInv = GameConfig.get(SingletonID).motherlodeChanceInv;
    uint256 entity = 0 << 128;
    assertFalse(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = 1 << 128;
    assertTrue(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = 2 << 128;
    assertTrue(!LibMotherlode.isMotherlode(entity, chanceInv));
  }

  function testFuzzMotherlodePrototype(bytes32 entity) public {
    (uint8 size, uint8 motherlodeType, uint256 cooldownSeconds) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
    assertLt(cooldownSeconds, 64);
  }

  function findMotherlode() public returns (bytes32, PositionData memory) {
    GameConfig memory config = gameConfig.get(SingletonID);
    address player = alice;
    spawn(player);
    vm.startPrank(deployer);
    bytes32 asteroid = position.get(addressToEntity(player)).parent;
    PositionData memory sourcePosition = getHomeAsteroid(player);
    bytes32 motherlodeSeed;
    console.log("sourcePosition x: ", uint32(sourcePosition.x));
    console.log("sourcePosition y: ", uint32(sourcePosition.y));
    PositionData memory targetPosition;
    uint32 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      PositionData memory targetPositionRelative = LibMotherlode.getPositionData(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      i++;
    }
    require(found, "uh oh, no motherlode found");
    console.log("motherlodeSeed: ", motherlodeSeed);
    return (asteroid, targetPosition);
  }

  function testCreateMotherlode() public {
    (bytes32 asteroid, PositionData memory position) = findMotherlode();
    LibMotherlode.createMotherlode(world, position);
    bytes32 motherlodeEntity = keccak256(abi.encode(asteroid, "motherlode", position.x, position.y));
    AsteroidType asteroidType = AsteroidType(world.get(AsteroidTypeID));
    ReversePosition reversePosition = ReversePosition(world.get(ReversePositionID));
    Motherlode motherlode = Motherlode(world.get(MotherlodeID));
    LastClaimedAt lastClaimedAt = LastClaimedAt(world.get(LastClaimedAtID));

    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(
      motherlodeEntity
    );

    assertPositionDataEq(position.get(motherlodeEntity), position);
    assertEq(lastClaimedAt.get(motherlodeEntity), block.number);
    assertEq(asteroidType.get(motherlodeEntity), ESpaceRockType.MOTHERLODE);
    assertEq(reversePosition.get(LibEncode.encodePositionData(position)), motherlodeEntity);
    assertEq(reversePosition.get(LibEncode.encodePositionData(position)), motherlodeEntity);

    Motherlode memory motherlode = motherlode.get(motherlodeEntity);
    assertEq(uint256(motherlode.size), uint256(LibMotherlode.getSize(size)));
    assertEq(uint256(motherlode.motherlodeType), uint256(LibMotherlode.getMotherlodeType(motherlodeType)));
    assertEq(motherlode.cooldownBlocks, cooldownBlocks);
  }

  function testFailNoMotherlodeNoSource() public {
    LibMotherlode.createMotherlode(world, PositionData(0, 0, 0));
  }

  /* -------------------------------- Claiming -------------------------------- */

  function testClaimMotherlode() public {
    MotherlodeResource motherlodeResource = MotherlodeResource(world.get(MotherlodeResourceID));
    Item item = Item(world.get(ItemID));
    P_UnitMining unitMining = P_UnitMining(world.get(P_UnitMiningID));
    LastClaimedAt lastClaimedAt = LastClaimedAt(world.get(LastClaimedAtID));

    (, PositionData memory position) = findMotherlode();
    bytes32 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    ResourceValue memory maxResource = LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity);
    bytes32 playerEntity = addressToEntity(deployer);

    vm.startPrank(world);
    MaxResourceCount.set(playerEntity, maxResource.resource, BIGNUM);
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);

    componentDevSystem.executeTyped(UnitsID, unitPlayerMotherlodeEntity, abi.encode(1));

    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResource, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner);

    uint32 totalMined = miningPower * uint32(timeElapsed);
    console.log("total mined: ", totalMined);
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), totalMined, "1 item");
    assertEq(LibMath.getSafe(motherlodeResource, motherlodeEntity), totalMined, "1 motherlode");
    uint256 lastClaimed = block.number;
    assertEq(lastClaimedAt.get(motherlodeEntity), lastClaimed, "1 last claimed");

    uint256 score = scoreMultiplier.get(maxResource.resource) * item.get(resourcePlayerEntity);
    console.log("score for %s motherlodeResource is %s", item.get(resourcePlayerEntity), score);
    assertEq(score.get(playerEntity), score, "score does not match");
  }

  function testClaimMultipleMotherlode() public {
    MotherlodeResource motherlodeResource = MotherlodeResource(world.get(MotherlodeResourceID));
    Item item = Item(world.get(ItemID));
    P_UnitMining unitMining = P_UnitMining(world.get(P_UnitMiningID));

    (, PositionData memory position) = findMotherlode();
    uint256 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    uint256 playerEntity = addressToEntity(deployer);
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);
    uint256 unit2PlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner2, playerEntity, motherlodeEntity);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(
      LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity).resource,
      playerEntity
    );
    componentDevSystem.executeTyped(P_MaxStorageID, resourcePlayerEntity, abi.encode(BIGNUM));

    componentDevSystem.executeTyped(UnitsID, unitPlayerMotherlodeEntity, abi.encode(1));
    componentDevSystem.executeTyped(UnitsID, unit2PlayerMotherlodeEntity, abi.encode(1));
    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResource, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner);
    uint32 miningPower2 = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner2);

    uint32 totalMined = miningPower * uint32(timeElapsed) + miningPower2 * uint32(timeElapsed);
    console.log("total mined: ", totalMined);
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), totalMined, "1 item");
    assertEq(LibMath.getSafe(motherlodeResource, motherlodeEntity), totalMined, "1 motherlode");
    uint256 lastClaimed = block.number;
    assertEq(LastClaimedAt(world.get(LastClaimedAtID)).get(motherlodeEntity), lastClaimed, "1 last claimed");
    uint256 score = scoreMultiplier.get(LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity).resource) *
      item.get(resourcePlayerEntity);
    console.log("score for %s Iron is %s", item.get(resourcePlayerEntity), score);
    assertEq(score.get(playerEntity), score, "score does not match");
  }

  function getMiningPowerOfUnit(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType
  ) public view returns (uint32) {
    P_UnitMining unitMining = P_UnitMining(world.get(P_UnitMiningID));
    uint32 playerUnitLevel = LibUnits.getPlayerUnitTypeLevel(world, playerEntity, unitType);
    return LibMath.getSafe(unitMining, LibEncode.hashKeyEntity(unitType, playerUnitLevel));
  }

  function testClaimMaxMotherlode() public {
    MotherlodeResource motherlodeResource = MotherlodeResource(world.get(MotherlodeResourceID));
    Item item = Item(world.get(ItemID));
    LastClaimedAt lastClaimedAt = LastClaimedAt(world.get(LastClaimedAtID));

    (, PositionData memory position) = findMotherlode();
    uint256 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    ResourceValue memory maxResource = LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity);
    uint256 playerEntity = addressToEntity(deployer);
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(maxResource.resource, playerEntity);
    componentDevSystem.executeTyped(P_MaxStorageID, resourcePlayerEntity, abi.encode(BIGNUM));
    componentDevSystem.executeTyped(UnitsID, unitPlayerMotherlodeEntity, abi.encode(1));

    uint256 timeElapsed = 1000000;

    vm.roll(block.number + timeElapsed);

    uint256 lastClaimed = block.number;
    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);
    uint256 totalMined = maxResource.value;
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), totalMined);
    assertEq(LibMath.getSafe(motherlodeResource, motherlodeEntity), totalMined);
    assertEq(lastClaimedAt.get(motherlodeEntity), lastClaimed);

    vm.roll(block.number + timeElapsed);
    lastClaimed = block.number;
    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);
    totalMined = maxResource.value;
    assertEq(LibMath.getSafe(item, resourcePlayerEntity), totalMined, "player resource does not match total mined");
    assertEq(
      LibMath.getSafe(motherlodeResource, motherlodeEntity),
      totalMined,
      "motherlode resource does not match total mined"
    );
    assertEq(lastClaimedAt.get(motherlodeEntity), lastClaimed, "last claimed does not match");

    uint256 score = scoreMultiplier.get(maxResource.resource) * item.get(resourcePlayerEntity);
    console.log("score for %s Iron is %s", item.get(resourcePlayerEntity), score);
    assertEq(score.get(playerEntity), score, "score does not match");
  }

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
    GameConfig memory config = GameConfig({
      moveSpeed: 100,
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 4
    });

    address player = alice;
    spawn(player);
    vm.startPrank(deployer);
    uint256 asteroid = 0xe19384268f063f61ad35763c513b0e482cc607fb876a26a511ae588042cfa35b;
    PositionData memory sourcePosition = PositionData(-16, 28, 0);
    for (uint32 i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
      console.log("ANGLE: ", (i * 360) / config.maxMotherlodesPerAsteroid);
      PositionData memory targetPositionRelative = LibMotherlode.getPositionData(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      PositionData memory targetPosition = PositionData(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      uint256 motherlodeSeed = uint256(
        keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y))
      );
      bool found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      if (found) {
        console.log("motherlode found: ");
      }
      logPosition(targetPosition);
      console.log(" ");
    }
  }
}
