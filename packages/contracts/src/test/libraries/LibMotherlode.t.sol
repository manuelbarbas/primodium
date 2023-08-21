// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { AsteroidCountComponent, ID as AsteroidCountComponentID } from "components/AsteroidCountComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { ReversePositionComponent, ID as ReversePositionComponentID } from "components/ReversePositionComponent.sol";

import "../../prototypes.sol";

import { LibMotherlode } from "../../libraries/LibMotherlode.sol";
import { LibMath } from "../../libraries/LibMath.sol";

import { Coord, Dimensions, Motherlode } from "../../types.sol";

contract LibMotherlodeTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testIsMotherlode() public {
    uint256 entity = 0 << 128;
    assertFalse(LibMotherlode.isMotherlode(entity));
    entity = 1 << 128;
    assertTrue(LibMotherlode.isMotherlode(entity));
    entity = 2 << 128;
    assertTrue(!LibMotherlode.isMotherlode(entity));
  }

  function testFuzzMotherlodePrototype(uint256 entity) public {
    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(entity);
    assertLt(uint256(size), 32);
    assertLt(uint256(motherlodeType), 32);
    assertLt(cooldownBlocks, 64);
  }

  function findMotherlode() public returns (uint256, Coord memory) {
    address player = bob;
    spawn(player);
    vm.startPrank(deployer);
    uint256 asteroid = getHomeAsteroid(player);
    Coord memory sourcePosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(asteroid);
    Coord memory targetPositionRelative = LibMotherlode.getCoord(0);
    Coord memory targetPosition = Coord(
      sourcePosition.x + targetPositionRelative.x,
      sourcePosition.y + targetPositionRelative.y,
      0
    );
    uint256 motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
    uint i = 0;
    bool found = LibMotherlode.isMotherlode(motherlodeSeed);
    while (i < 6 && !found) {
      i++;
      targetPositionRelative = LibMotherlode.getCoord(i);
      targetPosition = Coord(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
      found = LibMotherlode.isMotherlode(motherlodeSeed);
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

    (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) = LibMotherlode.getMotherlodeRawPrototype(
      motherlodeEntity
    );

    assertCoordEq(positionComponent.getValue(motherlodeEntity), position);
    assertEq(asteroidTypeComponent.getValue(motherlodeEntity), ESpaceRockType.MOTHERLODE);
    assertEq(reversePositionComponent.getValue(LibEncode.encodeCoord(position)), motherlodeEntity);

    Motherlode memory motherlode = motherlodeComponent.getValue(motherlodeEntity);
    assertEq(uint256(motherlode.size), uint256(LibMotherlode.getSize(size)));
    assertEq(uint256(motherlode.motherlodeType), uint256(LibMotherlode.getMotherlodeType(motherlodeType)));
    assertEq(motherlode.cooldownBlocks, cooldownBlocks);
  }

  function testFailNoMotherlodeNoSource() public {
    LibMotherlode.createMotherlode(world, Coord(0, 0, 0));
  }
}
