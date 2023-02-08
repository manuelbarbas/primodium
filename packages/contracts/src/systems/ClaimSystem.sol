// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Claim"));

contract ClaimSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(arguments, (uint256, Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    // check if main base
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length < 1, "can not destroy multiple tiles at once");
    require(entitiesAtPosition.length == 1, "can not destroy tile at empty coord");
    require(tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID);

    // check all miners that routing to the main base.
    // while true: 


    
    // Check that the miners sit on a valid resource

    // calculate last claim time

    // add to resource count

  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(blockType, coord));
  }
}
