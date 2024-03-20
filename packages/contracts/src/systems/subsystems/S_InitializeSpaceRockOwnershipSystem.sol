// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { MainBasePrototypeId } from "codegen/Prototypes.sol";
import { Position, PositionData } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract S_InitializeSpaceRockOwnershipSystem is PrimodiumSystem {
  function initializeSpaceRockOwnership(bytes32 spaceRock, bytes32 playerEntity) public _claimResources(spaceRock) {
    LibAsteroid.initializeSpaceRockOwnership(spaceRock, playerEntity);
    PositionData memory position = Position.get(MainBasePrototypeId);
    position.parent = spaceRock;

    bytes32 buildingEntity = LibBuilding.build(playerEntity, MainBasePrototypeId, position);
    IWorld world = IWorld(_world());
    world.Primodium__increaseMaxStorage(buildingEntity, 1);
    world.Primodium__upgradeProductionRate(buildingEntity, 1);
    world.Primodium__spendBuildingRequiredResources(buildingEntity, 1);
  }
}
