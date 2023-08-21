// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { ReversePositionComponent, ID as ReversePositionComponentID } from "components/ReversePositionComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { MineableAtComponent, ID as MineableAtComponentID } from "components/MineableAtComponent.sol";
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { MotherlodeResourceComponent, ID as MotherlodeResourceComponentID } from "components/MotherlodeResourceComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// libs
import { LibEncode } from "libraries/LibEncode.sol";

// types
import { Coord, ESpaceRockType, Motherlode, EMotherlodeSize, EMotherlodeType } from "src/types.sol";
import { TitaniumID, IridiumID, PlatinumID, KimberliteID } from "src/prototypes.sol";

library LibMotherlode {
  function createMotherlode(IWorld world, Coord memory position) internal returns (uint256) {
    ReversePositionComponent activeComponent = ReversePositionComponent(world.getComponent(ReversePositionComponentID));
    AsteroidTypeComponent asteroidTypeComponent = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID));
    for (uint256 i = 0; i < 6; i++) {
      Coord memory relPosition = LibMotherlode.getCoord(i);
      uint256 sourceEncodedPos = LibEncode.encodeCoord(
        Coord(relPosition.x + position.x, relPosition.y + position.y, 0)
      );
      if (!activeComponent.has(sourceEncodedPos)) continue;
      uint256 sourceAsteroid = activeComponent.getValue(sourceEncodedPos);
      if (asteroidTypeComponent.getValue(sourceAsteroid) == ESpaceRockType.MOTHERLODE) continue;
      uint256 motherlodeSeed = uint256(keccak256(abi.encode(sourceAsteroid, "motherlode", position)));
      if (!isMotherlode(motherlodeSeed)) continue;
      initMotherlode(world, position, motherlodeSeed);
      return motherlodeSeed;
    }
    revert("no motherlode found");
  }

  // a bit more than 1/6 chance of motherlode
  function isMotherlode(uint256 entity) internal pure returns (bool) {
    uint256 motherlodeType = LibEncode.getByteUInt(entity, 6, 128);
    return motherlodeType % 6 == 1;
  }

  function initMotherlode(IWorld world, Coord memory position, uint256 motherlodeEntity) internal {
    (uint8 rawSize, uint8 rawMotherlodeType, uint256 cooldownBlocks) = getMotherlodeRawPrototype(motherlodeEntity);
    EMotherlodeType motherlodeType = getMotherlodeType(rawMotherlodeType);
    EMotherlodeSize size = getSize(rawSize);
    MotherlodeComponent(world.getComponent(MotherlodeComponentID)).set(
      motherlodeEntity,
      Motherlode(size, motherlodeType, cooldownBlocks)
    );
    uint256 encodedPosition = LibEncode.encodeCoord(position);
    PositionComponent(world.getComponent(PositionComponentID)).set(motherlodeEntity, position);
    ReversePositionComponent(world.getComponent(ReversePositionComponentID)).set(encodedPosition, motherlodeEntity);
    AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID)).set(motherlodeEntity, ESpaceRockType.MOTHERLODE);
    MineableAtComponent(world.getComponent(MineableAtComponentID)).set(motherlodeEntity, block.number);
    LastClaimedAtComponent(world.getComponent(LastClaimedAtComponentID)).set(motherlodeEntity, block.number);

    uint256 resource = P_MotherlodeResourceComponent(world.getComponent(P_MotherlodeResourceComponentID))
      .getValue(LibEncode.hashKeyEntity(uint256(motherlodeType), uint256(size)))
      .resource;

    MotherlodeResourceComponent(world.getComponent(MotherlodeResourceComponentID)).set(
      LibEncode.hashKeyEntity(resource, motherlodeEntity),
      0
    );
  }

  function getMotherlodeRawPrototype(
    uint256 entity
  ) internal pure returns (uint8 size, uint8 motherlodeType, uint256 cooldownBlocks) {
    // 0-31 size
    size = uint8(LibEncode.getByteUInt(entity, 5, 0));
    // 0-31 motherlodeType
    motherlodeType = uint8(LibEncode.getByteUInt(entity, 5, 5));
    // 0-63 blocks to wait
    cooldownBlocks = LibEncode.getByteUInt(entity, 6, 10);
  }

  function getCoord(uint256 i) internal pure returns (Coord memory) {
    if (i == 0) return Coord(4, 0, 0);
    if (i == 1) return Coord(3, 4, 0);
    if (i == 2) return Coord(-3, 4, 0);
    if (i == 3) return Coord(-4, 0, 0);
    if (i == 4) return Coord(-3, -4, 0);
    return Coord(3, -4, 0);
  }

  function getSize(uint8 size) internal pure returns (EMotherlodeSize) {
    if (size <= 16) return EMotherlodeSize.SMALL;
    if (size <= 26) return EMotherlodeSize.MEDIUM;
    return EMotherlodeSize.LARGE;
  }

  function getMotherlodeType(uint8 motherlodeType) internal pure returns (EMotherlodeType) {
    if (motherlodeType <= 11) return EMotherlodeType.TITANIUM;
    if (motherlodeType < 21) return EMotherlodeType.IRIDIUM;
    if (motherlodeType < 27) return EMotherlodeType.PLATINUM;
    return EMotherlodeType.KIMBERLITE;
  }
}
