// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";
import { SiloID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

// TEMP: to be changed when level up siloes
int32 constant ATTACK_RADIUS = 5;
uint256 constant ATTACK_DAMAGE = 20;

// TEMP: default health if health component doesn't exist.
uint256 constant MAX_HEALTH = 100;

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    Coord memory coord = abi.decode(arguments, (Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // Check that the coordinates exist tiles
    uint256[] memory entities = positionComponent.getEntitiesWithValue(coord);
    require(entities.length == 1, "can not start path at empty coord");

    // Check that the coordinates are both conveyer tiles
    uint256 tileEntity = tileComponent.getValue(entities[0]);
    require(tileEntity == SiloID, "can not attack from not silo tile");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntity = ownedByComponent.getValue(entities[0]);
    require(ownedEntity == addressToEntity(msg.sender), "can not attack from not owned tile");

    // find all not owned tile in radius
    // deduct by x number of bullet in silo tile
    // deduct by z hp in tiles that were attacked

    // TODO: silo tile bullet deduct based on how many tiles attacked
    int32 tilesAttacked = 0;

    for (int32 i = coord.x; i < coord.x + ATTACK_RADIUS; i++) {
      for (int32 j = coord.y; j < coord.y + ATTACK_RADIUS; i++) {
        // if entity exists and not owned tile
        uint256[] memory curEntities = positionComponent.getEntitiesWithValue(Coord(i, j));
        if (curEntities.length == 1) {
          uint256 curOwnedEntity = ownedByComponent.getValue(entities[0]);
          if (curOwnedEntity != addressToEntity(msg.sender)) {
            // decrease by HP
            if (healthComponent.has(entities[0])) {
              uint256 curHealth = healthComponent.getValue(entities[0]);
              if (curHealth > 0) {
                healthComponent.set(entities[0], curHealth - ATTACK_DAMAGE);
              }
            } else {
              healthComponent.set(entities[0], MAX_HEALTH - ATTACK_DAMAGE);
            }
            tilesAttacked++;
          }
        }
      }
    }

    return abi.encode(entities[0]);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
