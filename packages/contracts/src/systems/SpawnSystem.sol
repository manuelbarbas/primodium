// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity } from "./internal/PrimodiumSystem.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";

import { Dimensions } from "../types.sol";
import { ExpansionResearch } from "../prototypes.sol";

uint256 constant ID = uint256(keccak256("system.Spawn"));

contract SpawnSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped() public returns (bytes memory) {
    return execute("");
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 playerEntity = addressToEntity(msg.sender);
    bool spawned = PositionComponent(world.getComponent(PositionComponentID)).has(playerEntity);
    require(!spawned, "[SpawnSystem] Player already spawned");
    uint256 asteroid = LibAsteroid.createAsteroid(world, playerEntity);

    DimensionsComponent dimensionsComponent = DimensionsComponent(world.getComponent(DimensionsComponentID));
    Dimensions memory dimensions = dimensionsComponent.getValue(ExpansionResearch);
    dimensionsComponent.set(playerEntity, dimensions);

    return abi.encode(asteroid);
  }
}
