// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { DebugNodeID, NodeID } from "../prototypes/Tiles.sol";
import { BuildingKey, BuildingTileKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(args, (Coord, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    uint256 playerEntity = addressToEntity(msg.sender);

    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256 startBuilding = getBuildingFromCoord(coordStart);
    uint256 endBuilding = getBuildingFromCoord(coordEnd);

    // Check that the coordinates are both conveyor tiles
    uint256 tileEntityAtStartCoord = tileComponent.getValue(startBuilding);
    require(
      tileEntityAtStartCoord == DebugNodeID || tileEntityAtStartCoord == NodeID,
      "[BuildPathSystem] Cannot start path at a non-supported tile (Conveyor, Node)"
    );
    uint256 tileEntityAtEndCoord = tileComponent.getValue(endBuilding);
    require(
      tileEntityAtEndCoord == DebugNodeID || tileEntityAtEndCoord == NodeID,
      "[BuildPathSystem] Cannot end path at a non-supported tile (Conveyor, Node)"
    );

    // Check that the coordinates are both owned by the msg.sender
    require(
      ownedByComponent.getValue(startBuilding) == playerEntity,
      "[BuildPathSystem] Cannot start path at a building you do not own"
    );
    require(
      ownedByComponent.getValue(endBuilding) == playerEntity,
      "[BuildPathSystem] Cannot end path at a building you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !pathComponent.has(startBuilding),
      "[BuildPathSystem] Cannot start more than one path from the same building"
    );

    // Add key
    pathComponent.set(startBuilding, endBuilding);

    return abi.encode(startBuilding);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
