// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// tables
import { P_Vault, TotalVault, Level, BuildingType } from "codegen/index.sol";

// types
import { BuildingTileKey } from "src/Keys.sol";
import { EResource } from "src/Types.sol";

library LibVault {
  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is increasing the defense
  /// @param level the level of the building for which the defense is increased
  function increasePlayerVault(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint8[] memory vaultResources = P_Vault.getResources(buildingType, level);
    uint256[] memory vaultAmounts = P_Vault.getAmounts(buildingType, level);
    for (uint256 i = 0; i < vaultResources.length; i++) {
      uint8 resource = vaultResources[i];
      uint256 vaultIncrease = vaultAmounts[i];
      if (level > 1 && P_Vault.lengthAmounts(buildingType, level - 1) > i) {
        vaultIncrease -= P_Vault.getAmounts(buildingType, level - 1)[i];
      }
      TotalVault.set(playerEntity, resource, TotalVault.get(playerEntity, resource) + vaultIncrease);
    }
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingEntity ID of the building which is clearing the defense
  function clearPlayerVault(bytes32 playerEntity, bytes32 buildingEntity) internal {
    uint256 level = Level.get(buildingEntity);
    bytes32 buildingType = BuildingType.get(buildingEntity);
    if (P_Vault.lengthResources(buildingType, level) > 0) {
      uint8[] memory vaultResources = P_Vault.getResources(buildingType, level);
      uint256[] memory vaultAmounts = P_Vault.getAmounts(buildingType, level);
      for (uint256 i = 0; i < vaultResources.length; i++) {
        uint8 resource = vaultResources[i];
        uint256 vaultIncrease = vaultAmounts[i];
        TotalVault.set(playerEntity, resource, TotalVault.get(playerEntity, resource) - vaultIncrease);
      }
    }
  }
}
