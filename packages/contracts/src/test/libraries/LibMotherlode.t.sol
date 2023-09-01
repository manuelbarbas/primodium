// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { P_UnitMiningComponent, ID as P_UnitMiningComponentID } from "components/P_UnitMiningComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ReversePositionComponent, ID as ReversePositionComponentID } from "components/ReversePositionComponent.sol";
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { MotherlodeResourceComponent, ID as MotherlodeResourceComponentID } from "components/MotherlodeResourceComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { ScoreComponent, ID as ScoreComponentID } from "components/ScoreComponent.sol";
import { P_ScoreMultiplierComponent, ID as P_ScoreMultiplierComponentID } from "components/P_ScoreMultiplierComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { BIGNUM } from "../../prototypes/Debug.sol";
import "src/types.sol";
import "src/prototypes.sol";

contract LibMotherlodeTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  PositionComponent public positionComponent;
  ScoreComponent public scoreComponent;
  P_ScoreMultiplierComponent public scoreMultiplierComponent;

  ComponentDevSystem public componentDevSystem;
  GameConfigComponent public gameConfigComponent;

  function setUp() public override {
    super.setUp();

    positionComponent = PositionComponent(world.getComponent(PositionComponentID));
    scoreComponent = ScoreComponent(world.getComponent(ScoreComponentID));
    scoreMultiplierComponent = P_ScoreMultiplierComponent(world.getComponent(P_ScoreMultiplierComponentID));

    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = GameConfig({
      moveSpeed: 100,
      motherlodeDistance: 8,
      maxMotherlodesPerAsteroid: 12,
      motherlodeChanceInv: 2
    });
    vm.prank(deployer);
    gameConfigComponent.set(SingletonID, gameConfig);
  }

  function testIsMotherlode() public {
    uint32 chanceInv = gameConfigComponent.getValue(SingletonID).motherlodeChanceInv;
    uint256 entity = 0 << 128;
    assertFalse(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = 1 << 128;
    assertTrue(LibMotherlode.isMotherlode(entity, chanceInv));
    entity = 2 << 128;
    assertTrue(!LibMotherlode.isMotherlode(entity, chanceInv));
  }

  function testFuzzMotherlodePrototype(uint256 entity) public {
    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
    assertLt(cooldownBlocks, 64);
  }

  function findMotherlode() public returns (uint256, Coord memory) {
    GameConfig memory config = gameConfigComponent.getValue(SingletonID);
    address player = alice;
    spawn(player);
    vm.startPrank(deployer);
    uint256 asteroid = positionComponent.getValue(addressToEntity(player)).parent;
    Coord memory sourcePosition = getHomeAsteroid(player);
    uint256 motherlodeSeed;
    console.log("sourcePosition x: ", uint32(sourcePosition.x));
    console.log("sourcePosition y: ", uint32(sourcePosition.y));
    Coord memory targetPosition;
    uint32 i = 0;
    bool found = false;
    while (i < 6 && !found) {
      Coord memory targetPositionRelative = LibMotherlode.getCoord(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      targetPosition = Coord(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition.x, targetPosition.y)));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
      i++;
    }
    require(found, "uh oh, no motherlode found");
    console.log("motherlodeSeed: ", motherlodeSeed);
    return (asteroid, targetPosition);
  }

  function testCreateMotherlode() public {
    (uint256 asteroid, Coord memory position) = findMotherlode();
    LibMotherlode.createMotherlode(world, position);
    uint256 motherlodeEntity = uint256(keccak256(abi.encode(asteroid, "motherlode", position.x, position.y)));
    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID));
    ReversePositionComponent reversePositionComponent = ReversePositionComponent(
      world.getComponent(ReversePositionComponentID)
    );
    MotherlodeComponent motherlodeComponent = MotherlodeComponent(world.getComponent(MotherlodeComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(
      motherlodeEntity
    );

    assertCoordEq(positionComponent.getValue(motherlodeEntity), position);
    assertEq(lastClaimedAtComponent.getValue(motherlodeEntity), block.number);
    assertEq(asteroidTypeComponent.getValue(motherlodeEntity), ESpaceRockType.MOTHERLODE);
    assertEq(reversePositionComponent.getValue(LibEncode.encodeCoord(position)), motherlodeEntity);
    assertEq(reversePositionComponent.getValue(LibEncode.encodeCoord(position)), motherlodeEntity);

    Motherlode memory motherlode = motherlodeComponent.getValue(motherlodeEntity);
    assertEq(uint256(motherlode.size), uint256(LibMotherlode.getSize(size)));
    assertEq(uint256(motherlode.motherlodeType), uint256(LibMotherlode.getMotherlodeType(motherlodeType)));
    assertEq(motherlode.cooldownBlocks, cooldownBlocks);
  }

  function testFailNoMotherlodeNoSource() public {
    LibMotherlode.createMotherlode(world, Coord(0, 0, 0));
  }

  /* -------------------------------- Claiming -------------------------------- */

  function testClaimMotherlode() public {
    MotherlodeResourceComponent motherlodeResourceComponent = MotherlodeResourceComponent(
      world.getComponent(MotherlodeResourceComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    P_UnitMiningComponent unitMiningComponent = P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    (, Coord memory position) = findMotherlode();
    uint256 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    ResourceValue memory maxResource = LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity);
    uint256 playerEntity = addressToEntity(deployer);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(maxResource.resource, playerEntity);

    componentDevSystem.executeTyped(P_MaxStorageComponentID, resourcePlayerEntity, abi.encode(BIGNUM));

    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);

    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerMotherlodeEntity, abi.encode(1));

    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner);

    uint32 totalMined = miningPower * uint32(timeElapsed);
    console.log("total mined: ", totalMined);
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), totalMined, "1 item");
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), totalMined, "1 motherlode");
    uint256 lastClaimed = block.number;
    assertEq(lastClaimedAtComponent.getValue(motherlodeEntity), lastClaimed, "1 last claimed");

    uint256 score = scoreMultiplierComponent.getValue(maxResource.resource) *
      itemComponent.getValue(resourcePlayerEntity);
    console.log("score for %s motherlodeResource is %s", itemComponent.getValue(resourcePlayerEntity), score);
    assertEq(scoreComponent.getValue(playerEntity), score, "score does not match");
  }

  function testClaimMultipleMotherlode() public {
    MotherlodeResourceComponent motherlodeResourceComponent = MotherlodeResourceComponent(
      world.getComponent(MotherlodeResourceComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    P_UnitMiningComponent unitMiningComponent = P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID));

    (, Coord memory position) = findMotherlode();
    uint256 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    uint256 playerEntity = addressToEntity(deployer);
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);
    uint256 unit2PlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner2, playerEntity, motherlodeEntity);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(
      LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity).resource,
      playerEntity
    );
    componentDevSystem.executeTyped(P_MaxStorageComponentID, resourcePlayerEntity, abi.encode(BIGNUM));

    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerMotherlodeEntity, abi.encode(1));
    componentDevSystem.executeTyped(UnitsComponentID, unit2PlayerMotherlodeEntity, abi.encode(1));
    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner);
    uint32 miningPower2 = getMiningPowerOfUnit(world, playerEntity, DebugUnitMiner2);

    uint32 totalMined = miningPower * uint32(timeElapsed) + miningPower2 * uint32(timeElapsed);
    console.log("total mined: ", totalMined);
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), totalMined, "1 item");
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), totalMined, "1 motherlode");
    uint256 lastClaimed = block.number;
    assertEq(
      LastClaimedAtComponent(world.getComponent(LastClaimedAtComponentID)).getValue(motherlodeEntity),
      lastClaimed,
      "1 last claimed"
    );
    uint256 score = scoreMultiplierComponent.getValue(
      LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity).resource
    ) * itemComponent.getValue(resourcePlayerEntity);
    console.log("score for %s Iron is %s", itemComponent.getValue(resourcePlayerEntity), score);
    assertEq(scoreComponent.getValue(playerEntity), score, "score does not match");
  }

  function getMiningPowerOfUnit(IWorld world, uint256 playerEntity, uint256 unitType) public view returns (uint32) {
    P_UnitMiningComponent unitMiningComponent = P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID));
    uint32 playerUnitLevel = LibUnits.getPlayerUnitTypeLevel(world, playerEntity, unitType);
    return LibMath.getSafe(unitMiningComponent, LibEncode.hashKeyEntity(unitType, playerUnitLevel));
  }

  function testClaimMaxMotherlode() public {
    MotherlodeResourceComponent motherlodeResourceComponent = MotherlodeResourceComponent(
      world.getComponent(MotherlodeResourceComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    (, Coord memory position) = findMotherlode();
    uint256 motherlodeEntity = LibMotherlode.createMotherlode(world, position);
    ResourceValue memory maxResource = LibMotherlode.getMaxMotherlodeResource(world, motherlodeEntity);
    uint256 playerEntity = addressToEntity(deployer);
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(maxResource.resource, playerEntity);
    componentDevSystem.executeTyped(P_MaxStorageComponentID, resourcePlayerEntity, abi.encode(BIGNUM));
    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerMotherlodeEntity, abi.encode(1));

    uint256 timeElapsed = 1000000;

    vm.roll(block.number + timeElapsed);

    uint256 lastClaimed = block.number;
    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);
    uint256 totalMined = maxResource.value;
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), totalMined);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), totalMined);
    assertEq(lastClaimedAtComponent.getValue(motherlodeEntity), lastClaimed);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);
    totalMined = maxResource.value;
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), totalMined);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), totalMined);
    assertEq(lastClaimedAtComponent.getValue(motherlodeEntity), lastClaimed);

    uint256 score = scoreMultiplierComponent.getValue(maxResource.resource) *
      itemComponent.getValue(resourcePlayerEntity);
    console.log("score for %s Iron is %s", itemComponent.getValue(resourcePlayerEntity), score);
    assertEq(scoreComponent.getValue(playerEntity), score, "score does not match");
  }

  function testPrintMotherlodeEntities() public view {
    for (uint32 i = 0; i < 10; i++) {
      Coord memory position = Coord(int32(i) * 7, int32(i) * 11, 0);
      uint256 motherlodeEntity = uint256(keccak256(abi.encode(uint256(i), "motherlode", position.x, position.y)));
      logCoord(position);
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
    Coord memory sourcePosition = Coord(-16, 28, 0);
    for (uint32 i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
      console.log("ANGLE: ", (i * 360) / config.maxMotherlodesPerAsteroid);
      Coord memory targetPositionRelative = LibMotherlode.getCoord(
        i,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid
      );
      Coord memory targetPosition = Coord(
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
      logCoord(targetPosition);
      console.log(" ");
    }
  }
}
