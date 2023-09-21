// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_GameConfig, P_GameConfigData, P_MotherlodeResource, P_MotherlodeResourceData, LastClaimedAt, Motherlode, MotherlodeData, Position, PositionData, ReversePosition, RockType } from "codegen/Tables.sol";
import { ERock, ESize, EMotherlodeType, EResource } from "codegen/Types.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { MotherlodeSet } from "libraries/MotherlodeSet.sol";

library LibMotherlode {
  /// @notice Create a new motherlode at a position
  /// @param position Position to place the motherlode
  /// @return motherlodeSeed Hash of the newly created motherlode
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

  /// @notice Checks if an entity is a motherlode
  /// @param entity Entity to check
  /// @param chanceInv Chance of being a motherlode
  /// @return True if it's a motherlode, false otherwise

  function isMotherlode(bytes32 entity, uint256 chanceInv) internal pure returns (bool) {
    uint256 motherlodeType = LibEncode.getByteUInt(uint256(entity), 6, 128);
    return motherlodeType % chanceInv == 1;
  }

  /// @dev Initialize a motherlode
  /// @param position Position to place the motherlode
  /// @param motherlodeEntity Hash of the motherlode to be initialized
  function initMotherlode(PositionData memory position, bytes32 motherlodeEntity) internal {
    (uint8 rawSize, uint8 rawMotherlodeType, uint256 cooldownSeconds) = getMotherlodeRawPrototype(motherlodeEntity);
    EMotherlodeType motherlodeType = getMotherlodeType(rawMotherlodeType);
    ESize size = getSize(rawSize);
    Motherlode.set(
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

  /// @dev Gets raw prototype for a motherlode
  /// @param entity Entity to fetch prototype for
  /// @return size raw id
  /// @return motherlodeType raw id
  /// @return cooldownSeconds between 0 and 63
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

  /// @dev Calculates position based on distance and max index
  /// @param i Index
  /// @param distance Distance
  /// @param max Max index
  /// @return position
  function getPosition(
    uint256 i,
    uint256 distance,
    uint256 max
  ) internal pure returns (PositionData memory) {
    return LibMath.getPositionByVector(distance, (i * 360) / max);
  }

  /// @dev Determines the size enum based on raw size
  /// @param size Raw size
  /// @return size enum
  function getSize(uint8 size) internal pure returns (ESize) {
    if (size <= 16) return ESize.Small;
    if (size <= 26) return ESize.Medium;
    return ESize.Large;
  }

  /// @dev Determines the motherlode type enum based on raw type
  /// @param motherlodeType Raw motherlode type
  /// @return motherlode type enum
  function getMotherlodeType(uint8 motherlodeType) internal pure returns (EMotherlodeType) {
    if (motherlodeType <= 11) return EMotherlodeType.Titanium;
    if (motherlodeType < 21) return EMotherlodeType.Iridium;
    if (motherlodeType < 27) return EMotherlodeType.Platinum;
    return EMotherlodeType.Kimberlite;
  }

  /// @dev Fetches maximum resource for a motherlode
  /// @param motherlodeEntity Hash of the motherlode
  /// @return Maximum resources data
  function getMaxMotherlodeResource(bytes32 motherlodeEntity) internal view returns (P_MotherlodeResourceData memory) {
    MotherlodeData memory motherlode = Motherlode.get(motherlodeEntity);
    return P_MotherlodeResource.get(motherlode.motherlodeType, motherlode.size);
  }
}
