// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastBuiltPathAtComponent, ID as LastBuiltPathAtComponentID } from "components/LastBuiltPathAtComponent.sol";
import { DebugNodeID, NodeID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(args, (Coord, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    LastBuiltPathAtComponent lastBuiltPathAtComponent = LastBuiltPathAtComponent(
      getAddressById(components, LastBuiltPathAtComponentID)
    );
    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256 startCoordEntity = LibEncode.encodeCoordEntity(coordStart, BuildingKey);
    require(tileComponent.has(startCoordEntity), "[BuildPathSystem] Cannot start path at an empty coordinate");
    uint256 endCoordEntity = LibEncode.encodeCoordEntity(coordEnd, BuildingKey);
    require(tileComponent.has(endCoordEntity), "[BuildPathSystem] Cannot end path at an empty coordinate");

    // Check that the coordinates are both conveyor tiles
    uint256 tileEntityAtStartCoord = tileComponent.getValue(startCoordEntity);
    require(
      tileEntityAtStartCoord == DebugNodeID || tileEntityAtStartCoord == NodeID,
      "[BuildPathSystem] Cannot start path at a non-supported tile (Conveyor, Node)"
    );
    uint256 tileEntityAtEndCoord = tileComponent.getValue(endCoordEntity);
    require(
      tileEntityAtEndCoord == DebugNodeID || tileEntityAtEndCoord == NodeID,
      "[BuildPathSystem] Cannot end path at a non-supported tile (Conveyor, Node)"
    );

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(startCoordEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot start path at a tile you do not own"
    );
    uint256 ownedEntityAtEndCoord = ownedByComponent.getValue(endCoordEntity);
    require(
      ownedEntityAtEndCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot end path at a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !pathComponent.has(startCoordEntity),
      "[BuildPathSystem] Cannot start more than one path from the same tile"
    );

    // Add key
    pathComponent.set(startCoordEntity, endCoordEntity);

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
