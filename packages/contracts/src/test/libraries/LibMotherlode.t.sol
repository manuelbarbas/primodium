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

import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";

import "src/types.sol";
import "src/prototypes.sol";

contract LibMotherlodeTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ComponentDevSystem public componentDevSystem;

  function setUp() public override {
    super.setUp();

    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
  }

  function testIsMotherlode() public {
    uint256 entity = 0 << 128;
    assertFalse(LibMotherlode.isMotherlode(entity, 6));
    entity = 1 << 128;
    assertTrue(LibMotherlode.isMotherlode(entity, 6));
    entity = 2 << 128;
    assertTrue(!LibMotherlode.isMotherlode(entity, 6));
  }

  function testFuzzMotherlodePrototype(uint256 entity) public {
    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
    assertLt(cooldownBlocks, 64);
  }

  function findMotherlode() public returns (uint256, Coord memory) {
    address player = deployer;
    spawn(player);
    vm.startPrank(deployer);
    uint256 asteroid = getHomeAsteroid(player);
    Coord memory sourcePosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(asteroid);
    Coord memory targetPositionRelative = LibMotherlode.getCoord(0, 4, 6);
    Coord memory targetPosition = Coord(
      sourcePosition.x + targetPositionRelative.x,
      sourcePosition.y + targetPositionRelative.y,
      0
    );
    uint256 motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
    uint32 i = 0;
    bool found = LibMotherlode.isMotherlode(motherlodeSeed, 6);
    while (i < 6 && !found) {
      i++;
      targetPositionRelative = LibMotherlode.getCoord(i, 4, 6);
      targetPosition = Coord(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
      found = LibMotherlode.isMotherlode(motherlodeSeed, 6);
    }
    require(found, "uh oh, no motherlode found");
    return (asteroid, targetPosition);
  }

  function testCreateMotherlode() public {
    (uint256 asteroid, Coord memory position) = findMotherlode();
    LibMotherlode.createMotherlode(world, position);
    uint256 motherlodeEntity = uint256(keccak256(abi.encode(asteroid, "motherlode", position)));
    PositionComponent positionComponent = PositionComponent(world.getComponent(PositionComponentID));
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
    uint256 unitPlayerMotherlodeEntity = LibEncode.hashEntities(DebugUnitMiner, playerEntity, motherlodeEntity);
    uint256 resourcePlayerEntity = LibEncode.hashKeyEntity(maxResource.resource, playerEntity);
    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerMotherlodeEntity, abi.encode(1));

    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = LibMath.getSafe(unitMiningComponent, DebugUnitMiner);

    uint32 totalMined = miningPower * uint32(timeElapsed);
    console.log("total mined: ", totalMined);
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), totalMined, "1 item");
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), totalMined, "1 motherlode");
    uint256 lastClaimed = block.number;
    assertEq(lastClaimedAtComponent.getValue(motherlodeEntity), lastClaimed, "1 last claimed");
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
    componentDevSystem.executeTyped(UnitsComponentID, unitPlayerMotherlodeEntity, abi.encode(1));
    componentDevSystem.executeTyped(UnitsComponentID, unit2PlayerMotherlodeEntity, abi.encode(1));
    uint256 timeElapsed = 1;
    // before claiming
    assertEq(LibMath.getSafe(itemComponent, resourcePlayerEntity), 0);
    assertEq(LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity), 0);

    vm.roll(block.number + timeElapsed);

    LibUpdateSpaceRock.claimMotherlodeResource(world, playerEntity, motherlodeEntity, block.number);

    uint32 miningPower = LibMath.getSafe(unitMiningComponent, DebugUnitMiner);
    uint32 miningPower2 = LibMath.getSafe(unitMiningComponent, DebugUnitMiner2);

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
  }
}
