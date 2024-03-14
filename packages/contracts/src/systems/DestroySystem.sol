// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IsActive, P_UnitProdTypes, Position, PositionData, BuildingType, OwnedBy, Level, BuildingType } from "codegen/index.sol";
import { LibBuilding, UnitFactorySet } from "codegen/Libraries.sol";
import { clearUtilityUsage, clearMaxStorageIncrease, clearProductionRate } from "libraries/SubsystemCalls.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param buildingEntity entity of the building to be destroyed
  function destroy(bytes32 buildingEntity) public _claimResources(Position.getParent(buildingEntity)) {
    LibBuilding.checkDestroyRequirements(_player(), buildingEntity);

    clearUtilityUsage(buildingEntity);
    clearMaxStorageIncrease(buildingEntity);
    clearProductionRate(buildingEntity);

    bytes32 buildingType = BuildingType.get(buildingEntity);

    uint256 level = Level.get(buildingEntity);

    LibBuilding.removeBuildingTiles(Position.get(buildingEntity));

    Level.deleteRecord(buildingEntity);
    BuildingType.deleteRecord(buildingEntity);
    OwnedBy.deleteRecord(buildingEntity);
    Position.deleteRecord(buildingEntity);
    IsActive.deleteRecord(buildingEntity);
    if (P_UnitProdTypes.length(buildingType, level) != 0) {
      UnitFactorySet.remove(OwnedBy.get(buildingEntity), buildingEntity);
    }
  }
}
