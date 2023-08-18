// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { ReversePositionComponent, ID as ReversePositionComponentID } from "components/ReversePositionComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { P_MotherlodeComponent, ID as P_MotherlodeComponentID } from "components/P_MotherlodeComponent.sol";
// libs
import { LibEncode } from "libraries/LibEncode.sol";

// types
import { Coord, ESpaceRockType, Motherlode, EMotherlodeSize, EMotherlodeType } from "src/types.sol";

library LibMotherlode {
  function createMotherlode(IWorld world, Coord memory position) internal {
    ReversePositionComponent activeComponent = ReversePositionComponent(world.getComponent(ReversePositionComponentID));
    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID));
    for (uint256 i = 0; i < 6; i++) {
      uint256 sourceEncodedPos = LibEncode.encodeCoord(getCoord(i));
      if (!activeComponent.has(sourceEncodedPos)) continue;
      uint256 sourceAsteroid = activeComponent.getValue(sourceEncodedPos);
      if (asteroidTypeComponent.getValue(sourceAsteroid) == uint256(ESpaceRockType.MOTHERLODE)) continue;
      uint256 motherlodeSeed = uint256(keccak256(abi.encode(sourceAsteroid, "motherlode", position)));
      if (!isMotherlode(motherlodeSeed)) continue;
      initMotherlode(world, position, motherlodeSeed);
      break;
    }
  }

  // 1/6 chance of motherlode
  function isMotherlode(uint256 entity) internal pure returns (bool) {
    uint256 motherlodeType = LibEncode.getByteUInt(entity, 128, 6);
    return motherlodeType % 6 == 1;
  }

  function getCoord(uint256 i) private pure returns (Coord memory) {
    if (i == 0) return Coord(4, 0, 0);
    if (i == 1) return Coord(3, 4, 0);
    if (i == 2) return Coord(-3, 4, 0);
    if (i == 3) return Coord(-4, 0, 0);
    if (i == 4) return Coord(-3, -4, 0);
    return Coord(3, -4, 0);
  }

  function initMotherlode(IWorld world, Coord memory position, uint256 motherlodeEntity) internal {
    // 0-31 size
    uint8 size = uint8(LibEncode.getByteUInt(motherlodeEntity, 5, 0));
    // 0-31 rarity
    uint8 rarity = uint8(LibEncode.getByteUInt(motherlodeEntity, 5, 5));
    // 0-63 blocks to wait
    uint256 waitBlocks = LibEncode.getByteUInt(motherlodeEntity, 6, 10);

    // 32 - 95 lifespan
    uint256 lifespan = LibEncode.getByteUInt(motherlodeEntity, 6, 16) + 32;
    P_MotherlodeComponent(world.getComponent(P_MotherlodeComponentID)).set(
      motherlodeEntity,
      Motherlode(getSize(size), getRarity(rarity), waitBlocks, lifespan)
    );
    uint256 encodedPosition = LibEncode.encodeCoord(position);
    PositionComponent(world.getComponent(PositionComponentID)).set(motherlodeEntity, position);
    ReversePositionComponent(world.getComponent(ReversePositionComponentID)).set(encodedPosition, motherlodeEntity);
    AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID)).set(
      motherlodeEntity,
      uint256(ESpaceRockType.MOTHERLODE)
    );
  }

  function getSize(uint8 size) internal pure returns (EMotherlodeSize) {
    if (size <= 16) return EMotherlodeSize.SMALL;
    if (size <= 26) return EMotherlodeSize.MEDIUM;
    return EMotherlodeSize.LARGE;
  }

  function getRarity(uint8 motherlodeType) internal pure returns (EMotherlodeType) {
    if (motherlodeType <= 11) return EMotherlodeType.TITANIUM;
    if (motherlodeType < 21) return EMotherlodeType.IRIDIUM;
    if (motherlodeType < 27) return EMotherlodeType.PLATINUM;
    return EMotherlodeType.KIMBERLITE;
  }
}
