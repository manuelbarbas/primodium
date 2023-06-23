// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { SiloID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { LibAttack } from "../libraries/LibAttack.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Attack"));

contract AttackSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function abs(int32 x) private pure returns (int32) {
    return x >= 0 ? x : -x;
  }

  // new function that takes in coord and attacks the entity at that coord
  function attack(
    uint256 attackEntity,
    Coord memory coord,
    Coord memory targetCoord,
    uint256 weaponKey
  ) public returns (uint8) {
    ClaimComponents memory c = ClaimComponents(
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );

    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    uint256 targetEntity = LibEncode.encodeCoordEntity(targetCoord, BuildingKey);
    require(c.tileComponent.has(targetEntity), "[AttackSystem] Cannot attack from an empty tile");

    uint256 curOwnedEntity = c.ownedByComponent.getValue(targetEntity);
    require(curOwnedEntity != addressToEntity(msg.sender), "[AttackSystem] Cannot attack your own entity");

    // check that attackEntity has enough bullets
    uint hashedAttackEntity = LibEncode.hashKeyEntity(weaponKey, attackEntity);
    if (itemComponent.has(hashedAttackEntity)) {
      uint256 curBullets = itemComponent.getValue(hashedAttackEntity);
      if (curBullets > 0) {
        itemComponent.set(hashedAttackEntity, curBullets - 1);
      } else {
        return 0;
      }
    } else {
      return 0;
    }

    // check that attackEntity is wtihin range of targetEntity by fetching getAttackRadius
    // compare coord and targetCoord
    int32 attackRadius = LibAttack.getAttackRadius(c.tileComponent.getValue(attackEntity));
    if (abs(coord.x - targetCoord.x) > attackRadius || abs(coord.y - targetCoord.y) > attackRadius) {
      return 0;
    }

    // decrease by HP
    if (c.healthComponent.has(targetEntity)) {
      uint256 curHealth = c.healthComponent.getValue(targetEntity);
      if (curHealth > 0) {
        c.healthComponent.set(targetEntity, curHealth - LibAttack.getAttackDamage(weaponKey));
      }
    } else {
      uint256 targetTileEntity = c.tileComponent.getValue(targetEntity);
      c.healthComponent.set(
        targetEntity,
        LibHealth.getBuildingMaxHealth(targetTileEntity) - LibAttack.getAttackDamage(weaponKey)
      );
    }

    // If health is 0, then demolish the target entity
    if (c.healthComponent.getValue(targetEntity) <= 0) {
      c.tileComponent.remove(targetEntity);
      c.ownedByComponent.remove(targetEntity);
      c.lastClaimedAtComponent.remove(targetEntity);
      c.healthComponent.remove(targetEntity);
      lastBuiltAtComponent.remove(targetEntity);
    }

    return 1;
  }

  function execute(bytes memory args) public returns (bytes memory) {
    (Coord memory coord, Coord memory targetCoord, uint256 weaponKey) = abi.decode(args, (Coord, Coord, uint256));

    ClaimComponents memory c = ClaimComponents(
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    // Check that the coordinates exist for the silo tile
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(c.tileComponent.has(entity), "[AttackSystem] Cannot attack from an empty tile");

    // Check that it is a silo tile
    uint256 tileEntity = c.tileComponent.getValue(entity);
    require(LibAttack.isValidWeaponStorage(tileEntity), "[AttackSystem] Cannot attack from a non-silo tile");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntity = c.ownedByComponent.getValue(entity);
    require(ownedEntity == addressToEntity(msg.sender), "[AttackSystem] Cannot attack from a tile you do not own");

    // Check that the weaponKey is valid
    require(LibAttack.isValidWeapon(weaponKey), "[AttackSystem] Invalid weapon key");

    return abi.encode(attack(entity, coord, targetCoord, weaponKey));
  }

  // select start coord, targetCoord, and weaponKey
  function executeTyped(Coord memory coord, Coord memory targetCoord, uint256 weaponKey) public returns (bytes memory) {
    return execute(abi.encode(coord, targetCoord, weaponKey));
  }
}
