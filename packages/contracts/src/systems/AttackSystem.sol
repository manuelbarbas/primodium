// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { SiloID } from "../prototypes/Tiles.sol";

import { CraftedComponents } from "../prototypes/CraftedComponents.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

import { LibHealth } from "../libraries/LibHealth.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    Coord memory coord = abi.decode(arguments, (Coord));

    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    CraftedComponents memory cc = CraftedComponents(
      BulletCraftedComponent(getAddressById(components, BulletCraftedComponentID))
    );

    // Check that the coordinates exist tiles
    uint256[] memory entities = c.positionComponent.getEntitiesWithValue(coord);
    require(entities.length == 1, "can not start path at empty coord");

    // Check that the coordinates are both conveyer tiles
    uint256 tileEntity = c.tileComponent.getValue(entities[0]);
    require(tileEntity == SiloID, "can not attack from not silo tile");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntity = c.ownedByComponent.getValue(entities[0]);
    require(ownedEntity == addressToEntity(msg.sender), "can not attack from not owned tile");

    // find all not owned tile in radius
    // deduct by x number of bullet in silo tile
    // deduct by z hp in tiles that were attacked

    // TODO: silo tile bullet deduct based on how many tiles attacked
    int32 tilesAttacked = 0;

    for (int32 i = coord.x; i < coord.x + LibHealth.ATTACK_RADIUS; i++) {
      for (int32 j = coord.y; j < coord.y + LibHealth.ATTACK_RADIUS; i++) {
        // if entity exists and not owned tile
        uint256[] memory curEntities = c.positionComponent.getEntitiesWithValue(Coord(i, j));
        if (curEntities.length == 1) {
          uint256 curOwnedEntity = c.ownedByComponent.getValue(entities[0]);
          if (curOwnedEntity != addressToEntity(msg.sender)) {
            // decrease by HP
            if (c.healthComponent.has(entities[0])) {
              uint256 curHealth = c.healthComponent.getValue(entities[0]);
              if (curHealth > 0) {
                c.healthComponent.set(entities[0], curHealth - LibHealth.ATTACK_DAMAGE);
              }
            } else {
              c.healthComponent.set(entities[0], LibHealth.MAX_HEALTH - LibHealth.ATTACK_DAMAGE);
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
