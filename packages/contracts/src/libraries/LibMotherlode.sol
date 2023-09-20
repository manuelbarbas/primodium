// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_GameConfig, P_GameConfigData, P_MotherlodeResource, P_MotherlodeResourceData, LastClaimedAt, MotherlodeData, Position, PositionData, ReversePosition, RockType } from "codegen/Tables.sol";
import { ERock, ESize, EMotherlodeType, EResource } from "codegen/Types.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { MotherlodeSet } from "libraries/MotherlodeSet.sol";

library LibMotherlode {
  function createMotherlode(PositionData memory position) internal returns (bytes32) {
    P_GameConfigData memory config = P_GameConfig.get();
    for (uint256 i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
      PositionData memory sourcePosition = getPosition(i, config.motherlodeDistance, config.maxMotherlodesPerAsteroid);
      sourcePosition.x += position.x;
      sourcePosition.y += position.y;
      bytes32 sourceAsteroid = ReversePosition.get(sourcePosition.x, sourcePosition.y);
      if (sourceAsteroid == 0) continue;
      if (RockType.get(sourceAsteroid) == ERock.Motherlode) continue;
      bytes32 motherlodeSeed = keccak256(abi.encode(sourceAsteroid, "motherlode", position.x, position.y));
      if (!isMotherlode(motherlodeSeed, config.motherlodeChanceInv)) continue;
      initMotherlode(position, motherlodeSeed);
      return motherlodeSeed;
    }
    revert("no motherlode found");
  }

  // a bit more than 1/6 chance of motherlode
  function isMotherlode(bytes32 entity, uint256 chanceInv) internal pure returns (bool) {
    uint256 motherlodeType = LibEncode.getByteUInt(uint256(entity), 6, 128);
    return motherlodeType % chanceInv == 1;
  }

  function initMotherlode(PositionData memory position, bytes32 motherlodeEntity) internal {
    (uint8 rawSize, uint8 rawMotherlodeType, uint256 cooldownSeconds) = getMotherlodeRawPrototype(motherlodeEntity);
    EMotherlodeType motherlodeType = getMotherlodeType(rawMotherlodeType);
    ESize size = getSize(rawSize);
    MotherlodeSet.set(
      motherlodeEntity,
      MotherlodeData({
        ownedBy: 0,
        size: size,
        motherlodeType: motherlodeType,
        quantity: 0,
        cooldownSeconds: cooldownSeconds,
        mineableAt: block.timestamp
      })
    );

    Position.set(motherlodeEntity, position);
    ReversePosition.set(position.x, position.y, motherlodeEntity);
    LastClaimedAt.set(motherlodeEntity, block.timestamp);
    RockType.set(motherlodeEntity, ERock.Motherlode);
  }

  function getMotherlodeRawPrototype(bytes32 entity)
    internal
    pure
    returns (
      uint8 size,
      uint8 motherlodeType,
      uint256 cooldownSeconds
    )
  {
    uint256 motherlodeEntity = uint256(entity);
    // 0-31 size
    size = uint8(LibEncode.getByteUInt(motherlodeEntity, 5, 0));
    // 0-31 motherlodeType
    motherlodeType = uint8(LibEncode.getByteUInt(motherlodeEntity, 5, 5));
    // 0-63 seconds to wait
    cooldownSeconds = LibEncode.getByteUInt(motherlodeEntity, 6, 10);
  }

  function getPosition(
    uint256 i,
    uint256 distance,
    uint256 max
  ) internal pure returns (PositionData memory) {
    return LibMath.getPositionByVector(distance, (i * 360) / max);
  }

  function getSize(uint8 size) internal pure returns (ESize) {
    if (size <= 16) return ESize.Small;
    if (size <= 26) return ESize.Medium;
    return ESize.Large;
  }

  function getMotherlodeType(uint8 motherlodeType) internal pure returns (EMotherlodeType) {
    if (motherlodeType <= 11) return EMotherlodeType.Titanium;
    if (motherlodeType < 21) return EMotherlodeType.Iridium;
    if (motherlodeType < 27) return EMotherlodeType.Platinum;
    return EMotherlodeType.Kimberlite;
  }

  function getMaxMotherlodeResource(bytes32 motherlodeEntity) internal view returns (P_MotherlodeResourceData memory) {
    MotherlodeData memory motherlode = MotherlodeSet.get(motherlodeEntity);
    return P_MotherlodeResource.get(motherlode.motherlodeType, motherlode.size);
  }
}
