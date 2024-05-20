// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Position } from "codegen/index.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { IWorld } from "codegen/world/IWorld.sol";

contract DestroySystem is PrimodiumSystem {
  /// @notice Destroys a building entity
  /// @param buildingEntity entity of the building to be destroyed
  function destroy(
    bytes32 buildingEntity
  )
    public
    _claimResources(Position.getParentEntity(buildingEntity))
    _claimUnits(Position.getParentEntity(buildingEntity))
  {
    LibBuilding.checkDestroyRequirements(_player(), buildingEntity);

    IWorld world = IWorld(_world());
    world.Pri_11__clearUtilityUsage(buildingEntity);
    world.Pri_11__clearMaxStorageIncrease(buildingEntity);
    world.Pri_11__clearProductionRate(buildingEntity);

    // requirements checked on line 20
    LibBuilding.destroy(_player(), buildingEntity, true);
  }
}
