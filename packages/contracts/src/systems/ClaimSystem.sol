// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ResourceComponents } from "../prototypes/ResourceComponents.sol";
import { CraftedComponents } from "../prototypes/CraftedComponents.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { ResourceResearchComponents } from "../prototypes/ResourceResearchComponents.sol";

// Resource Components
import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/OsmiumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/UraniniteResourceComponent.sol";

// Resource Research Components
import { CopperResearchComponent, ID as CopperResearchComponentID } from "components/CopperResearchComponent.sol";
import { LithiumResearchComponent, ID as LithiumResearchComponentID } from "components/LithiumResearchComponent.sol";
import { TitaniumResearchComponent, ID as TitaniumResearchComponentID } from "components/TitaniumResearchComponent.sol";
import { OsmiumResearchComponent, ID as OsmiumResearchComponentID } from "components/OsmiumResearchComponent.sol";
import { TungstenResearchComponent, ID as TungstenResearchComponentID } from "components/TungstenResearchComponent.sol";
import { IridiumResearchComponent, ID as IridiumResearchComponentID } from "components/IridiumResearchComponent.sol";
import { KimberliteResearchComponent, ID as KimberliteResearchComponentID } from "components/KimberliteResearchComponent.sol";

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

import { MainBaseID, MinerID, ConveyerID, SiloID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID, BulletFactoryID } from "../prototypes/Tiles.sol";
import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibCraft } from "libraries/LibCraft.sol";
import { LibMine } from "libraries/LibMine.sol";

uint256 constant ID = uint256(keccak256("system.Claim"));

contract ClaimSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function claimBuilding(Coord memory coord, uint256 originEntity, uint256 destination) public {
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    ResourceComponents memory rc = ResourceComponents(
      BolutiteResourceComponent(getAddressById(components, BolutiteResourceComponentID)),
      CopperResourceComponent(getAddressById(components, CopperResourceComponentID)),
      IridiumResourceComponent(getAddressById(components, IridiumResourceComponentID)),
      IronResourceComponent(getAddressById(components, IronResourceComponentID)),
      KimberliteResourceComponent(getAddressById(components, KimberliteResourceComponentID)),
      LithiumResourceComponent(getAddressById(components, LithiumResourceComponentID)),
      OsmiumResourceComponent(getAddressById(components, OsmiumResourceComponentID)),
      TungstenResourceComponent(getAddressById(components, TungstenResourceComponentID)),
      UraniniteResourceComponent(getAddressById(components, UraniniteResourceComponentID))
    );

    CraftedComponents memory cc = CraftedComponents(
      BulletCraftedComponent(getAddressById(components, BulletCraftedComponentID))
    );

    ResourceResearchComponents memory rrc = ResourceResearchComponents(
      CopperResearchComponent(getAddressById(components, CopperResearchComponentID)),
      LithiumResearchComponent(getAddressById(components, LithiumResearchComponentID)),
      TitaniumResearchComponent(getAddressById(components, TitaniumResearchComponentID)),
      OsmiumResearchComponent(getAddressById(components, OsmiumResearchComponentID)),
      TungstenResearchComponent(getAddressById(components, TungstenResearchComponentID)),
      IridiumResearchComponent(getAddressById(components, IridiumResearchComponentID)),
      KimberliteResearchComponent(getAddressById(components, KimberliteResearchComponentID))
    );

    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (entitiesAtPosition.length == 1) {
      // Check that health is not zero
      require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");
    }

    if (entitiesAtPosition.length == 1 && entitiesAtPosition[0] == originEntity) {
      // Prevent conveyer tiles to re-claim buildings that we originally started claiming from
      // if an infinite loop, the game will just run out of gas.
      return;
    }

    if (entitiesAtPosition.length == 1 && c.tileComponent.getValue(entitiesAtPosition[0]) == MinerID) {
      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // fetch tile beneath minerc.
      uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

      uint256 incBy = LibMine.mine(rrc, c.lastClaimedAtComponent, resourceKey, entitiesAtPosition[0]);

      // TODO: generic library for checking whether a resource is unlocked (research component)
      // uint256 startClaimTime = c.lastClaimedAtComponent.getValue(entitiesAtPosition[0]);
      // uint256 endClaimTime = block.number;
      // uint256 incBy = 10 * (endClaimTime - startClaimTime);
      // c.lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

      if (resourceKey == BolutiteID) {
        LibMath.incrementBy(rc.bolutiteResourceComponent, destination, incBy);
      } else if (resourceKey == CopperID) {
        LibMath.incrementBy(rc.copperResourceComponent, destination, incBy);
      } else if (resourceKey == IridiumID) {
        LibMath.incrementBy(rc.iridiumResourceComponent, destination, incBy);
      } else if (resourceKey == IronID) {
        LibMath.incrementBy(rc.ironResourceComponent, destination, incBy);
      } else if (resourceKey == KimberliteID) {
        LibMath.incrementBy(rc.kimberliteResourceComponent, destination, incBy);
      } else if (resourceKey == LithiumID) {
        LibMath.incrementBy(rc.lithiumResourceComponent, destination, incBy);
      } else if (resourceKey == OsmiumID) {
        LibMath.incrementBy(rc.osmiumResourceComponent, destination, incBy);
      } else if (resourceKey == TungstenID) {
        LibMath.incrementBy(rc.tungstenResourceComponent, destination, incBy);
      } else if (resourceKey == UraniniteID) {
        LibMath.incrementBy(rc.uraniniteResourceComponent, destination, incBy);
      }
      //
    } else if (entitiesAtPosition.length == 1 && c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // transfer all items from the bullet factory to the destination
      LibMath.transfer(rc.bolutiteResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.copperResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.iridiumResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.ironResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.kimberliteResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.lithiumResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.osmiumResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.tungstenResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(rc.uraniniteResourceComponent, entitiesAtPosition[0], destination);
      LibMath.transfer(cc.bulletCraftedComponent, entitiesAtPosition[0], destination);
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function claimAdjacentBuildings(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimBuilding(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  // pass in a coordinate of a conveyer block, which fetches all other
  function claimConveyerTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == ConveyerID) {
      // Check that health is not zero
      require(LibHealth.checkAlive(healthComponent, entitiesAtPosition[0]), "health is not zero");

      claimAdjacentBuildings(coord, originEntity, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyer tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimConveyerTile(positionComponent.getValue(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyer nodes.
  function claimAdjacentConveyerTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimConveyerTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimConveyerTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimConveyerTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimConveyerTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    // Factory resources (add more when needed)
    CopperResourceComponent copperResourceComponent = CopperResourceComponent(
      getAddressById(components, CopperResourceComponentID)
    );
    IronResourceComponent ironResourceComponent = IronResourceComponent(
      getAddressById(components, IronResourceComponentID)
    );
    BulletCraftedComponent bulletCraftedComponent = BulletCraftedComponent(
      getAddressById(components, BulletCraftedComponentID)
    );

    Coord memory coord = abi.decode(arguments, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not claim base at empty coord");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    // Check that health is not zero
    require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");

    uint256 endClaimTime = block.number;
    c.lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

    // destination is either a wallet (store item in wallet-specific global inventory)
    // or entity ID (store item in entity, eg within a factory)

    if (c.tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID) {
      // check main base, if so destination is the wallet
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], addressToEntity(msg.sender));
      //
    } else if (c.tileComponent.getValue(entitiesAtPosition[0]) == SiloID) {
      // store items in the silo for emitting bullets
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], destination);
      //
    } else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
      // check bullet, if so destination is the entity
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], destination);

      LibCraft.craftBullet(ironResourceComponent, copperResourceComponent, bulletCraftedComponent, destination);
    }
    // TODO: gracefully exit

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
