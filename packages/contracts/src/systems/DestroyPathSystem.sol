// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ConveyerID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.DestroyPath"));

contract DestroyPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (Coord memory coordStart) = abi.decode(arguments, (Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    // Check that the coordinates exist tiles
    uint256[] memory entitiesAtStartCoord = positionComponent.getEntitiesWithValue(coordStart);
    require(entitiesAtStartCoord.length == 1, "can not destroy start path at empty coord");

    // Check that the coordinates is a conveyer tile
    uint256 tileEntityAtStartCoord = tileComponent.getValue(entitiesAtStartCoord[0]);
    require(tileEntityAtStartCoord == ConveyerID, "can not destroy start path at not conveyer tile");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtStartCoord[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not destroy start path at not owned tile");

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(ownedByComponent.has(entitiesAtStartCoord[0]), "path does not exist at the start tile");
    
    // remove key
    pathComponent.remove(entitiesAtStartCoord[0]);

    return abi.encode(entitiesAtStartCoord[0]);
  }

  function executeTyped(Coord memory coordStart) public returns (bytes memory) {
    return execute(abi.encode(coordStart));
  }
}
