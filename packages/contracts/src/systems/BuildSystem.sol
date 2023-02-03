// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 blockEntity, Coord memory coord) = abi.decode(arguments, (uint256, Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));

    // Check there isn't another tile there
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 0, "can not built at non-empty coord");

    // TODO: Check that the tile is in the user's inventory. 
    // Remove from user's inventory
    positionComponent.set(blockEntity, coord);
  }

  function executeTyped(uint256 entity, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(entity, coord));
  }
}
