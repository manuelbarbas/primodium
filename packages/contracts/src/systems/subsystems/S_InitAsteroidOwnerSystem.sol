// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { MainBasePrototypeId, WormholeBasePrototypeId } from "codegen/Prototypes.sol";
import { Home, Position, PositionData, Asteroid } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract S_InitAsteroidOwnerSystem is PrimodiumSystem {
  function initAsteroidOwner(bytes32 asteroidEntity, bytes32 playerEntity) public _claimResources(asteroidEntity) {
    LibAsteroid.initAsteroidOwner(asteroidEntity, playerEntity);

    // Create main base, mirroring the BuildSystem logic
    // todo: figure out how to just call the BuildSystem with the playerEntity as msg.sender

    bytes32 basePrototype = Asteroid.getWormhole(asteroidEntity) ? WormholeBasePrototypeId : MainBasePrototypeId;
    PositionData memory position = Position.get(basePrototype);

    position.parentEntity = asteroidEntity;

    bytes32 buildingEntity = LibBuilding.build(playerEntity, basePrototype, position);
    IWorld world = IWorld(_world());
    world.Primodium__increaseMaxStorage(buildingEntity, 1);
    world.Primodium__upgradeProductionRate(buildingEntity, 1);
    world.Primodium__spendBuildingRequiredResources(buildingEntity, 1);
  }
}
