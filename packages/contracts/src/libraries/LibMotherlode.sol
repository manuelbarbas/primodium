// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_GameConfig, P_GameConfigData, P_MotherlodeResource, P_MotherlodeResourceData, UnitCount, P_MiningUnits, P_MiningPower, LastClaimedAt, Motherlode, MotherlodeData, Position, PositionData, ReversePosition, RockType, P_Unit, UnitLevel } from "codegen/Tables.sol";
import { ERock, EUnit, ESize, EResource } from "codegen/Types.sol";
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
    EResource motherlodeType = getMotherlodeType(rawMotherlodeType);
    ESize size = getSize(rawSize);
    Motherlode.set(
      motherlodeEntity,
      MotherlodeData({
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
  function getMotherlodeType(uint8 motherlodeType) internal pure returns (EResource) {
    if (motherlodeType <= 11) return EResource.Titanium;
    if (motherlodeType < 21) return EResource.Iridium;
    if (motherlodeType < 27) return EResource.Platinum;
    return EResource.Kimberlite;
  }

  /// @dev Fetches maximum resource for a motherlode
  /// @param motherlodeEntity Hash of the motherlode
  /// @return Maximum resources data
  function getMaxMotherlodeResource(bytes32 motherlodeEntity) internal view returns (P_MotherlodeResourceData memory) {
    MotherlodeData memory motherlode = Motherlode.get(motherlodeEntity);
    return P_MotherlodeResource.get(motherlode.motherlodeType, motherlode.size);
  }

  function getAllMotherlodeClaims(bytes32 playerEntity) internal returns (uint256[] memory resources) {
    resources = new uint256[](uint8(EResource.LENGTH));
    bytes32[] memory motherlodes = MotherlodeSet.getAll(playerEntity);
    bytes32[] memory miningUnits = P_MiningUnits.get();
    for (uint256 i = 0; i < motherlodes.length; i++) {
      (EResource resource, uint256 increase) = getMotherlodeClaims(playerEntity, motherlodes[i], miningUnits);
      resources[uint8(resource)] += increase;
    }
  }

  // what happens if multiple cycles of filling and cooling down and refilling have occurred?
  function getMotherlodeClaims(
    bytes32 playerEntity,
    bytes32 motherlodeEntity,
    bytes32[] memory miningUnits
  ) internal returns (EResource resource, uint256 increase) {
    MotherlodeData memory motherlode = Motherlode.get(motherlodeEntity);
    resource = motherlode.motherlodeType;

    if (motherlode.mineableAt > block.timestamp) return (resource, 0);

    P_MotherlodeResourceData memory motherlodePrototypeData = P_MotherlodeResource.get(
      motherlode.motherlodeType,
      motherlode.size
    );

    uint256 miningPower;
    for (uint256 j = 0; j < miningUnits.length; j++) {
      uint256 level = UnitLevel.get(playerEntity, miningUnits[j]);
      miningPower += P_MiningPower.get(miningUnits[j], level);
    }

    uint256 lastClaimed = LastClaimedAt.get(motherlodeEntity);
    uint256 timeSinceClaimed = block.timestamp - lastClaimed;
    increase = LibMath.min(miningPower * timeSinceClaimed, motherlodePrototypeData.amount - motherlode.quantity);

    uint256 resourceCount = increase + motherlode.quantity;
    if (resourceCount == motherlodePrototypeData.amount) {
      // there needs to be some modulo magic here
      uint256 timeMaxed = block.timestamp - ((miningPower * timeSinceClaimed) - motherlodePrototypeData.amount);
      motherlode.mineableAt = timeMaxed + motherlode.cooldownSeconds;
      motherlode.quantity = 0;
      Motherlode.set(motherlodeEntity, motherlode);
    }
  }
}
