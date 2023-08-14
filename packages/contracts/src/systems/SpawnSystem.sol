// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity } from "./internal/PrimodiumSystem.sol";

// components
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

// libraries
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibEncode } from "libraries/LibEncode.sol";

import { Dimensions } from "../types.sol";
import { ExpansionResearch } from "../prototypes.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

// types
import { Coord } from "../types.sol";
import { MainBaseID, BuildingKey } from "../prototypes.sol";

uint256 constant ID = uint256(keccak256("system.Spawn"));

contract SpawnSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped() public returns (bytes memory) {
    return execute("");
  }

  function execute(bytes memory) public override returns (bytes memory) {
    uint256 playerEntity = addressToEntity(msg.sender);
    PositionComponent positionComponent = PositionComponent(world.getComponent(PositionComponentID));
    bool spawned = positionComponent.has(playerEntity);
    require(!spawned, "[SpawnSystem] Player already spawned");
    uint256 asteroid = LibAsteroid.createAsteroid(world, playerEntity);

    Coord memory coord = positionComponent.getValue(MainBaseID);
    coord.parent = asteroid;
    uint256 buildingEntity = LibEncode.hashKeyCoord(BuildingKey, coord);

    MainBaseComponent(getC(MainBaseComponentID)).set(playerEntity, buildingEntity);
    LevelComponent(getC(LevelComponentID)).set(playerEntity, 1);

    LibBuilding.build(world, MainBaseID, coord);

    return abi.encode(asteroid);
  }
}
