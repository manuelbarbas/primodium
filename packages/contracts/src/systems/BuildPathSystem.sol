// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ConveyorID, NodeID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(arguments, (Coord, Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256[] memory entitiesAtStartCoord = positionComponent.getEntitiesWithValue(coordStart);
    require(entitiesAtStartCoord.length == 1, "[BuildPathSystem] Cannot start path at an empty coordinate");
    uint256[] memory entitiesAtEndCoord = positionComponent.getEntitiesWithValue(coordEnd);
    require(entitiesAtEndCoord.length == 1, "[BuildPathSystem] Cannot end path at an empty coordinate");

    // Check that the coordinates are both conveyor tiles
    uint256 tileEntityAtStartCoord = tileComponent.getValue(entitiesAtStartCoord[0]);
    require(
      tileEntityAtStartCoord == ConveyorID || tileEntityAtStartCoord == NodeID,
      "[BuildPathSystem] Cannot start path at a supported tile (Conveyor, Node)"
    );
    uint256 tileEntityAtEndCoord = tileComponent.getValue(entitiesAtEndCoord[0]);
    require(
      tileEntityAtEndCoord == ConveyorID || tileEntityAtStartCoord == NodeID,
      "[BuildPathSystem] Cannot end path at a supported tile (Conveyor, Node)"
    );

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtStartCoord[0]);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot start path at a tile you do not own"
    );
    uint256 ownedEntityAtEndCoord = ownedByComponent.getValue(entitiesAtEndCoord[0]);
    require(
      ownedEntityAtEndCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot end path at a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !pathComponent.has(entitiesAtStartCoord[0]),
      "[BuildPathSystem] Cannot start more than one path from the same tile"
    );

    // Add key
    pathComponent.set(entitiesAtStartCoord[0], entitiesAtEndCoord[0]);

    return abi.encode(entitiesAtStartCoord[0]);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
