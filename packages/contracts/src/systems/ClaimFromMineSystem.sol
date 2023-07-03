// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastResearchedAtComponent, ID as LastResearchedAtComponentID } from "components/LastResearchedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";

// Debug Buildings
import { MainBaseID, DebugNodeID, MinerID, LithiumMinerID, SiloID } from "../prototypes/Tiles.sol";

// Production Buildings
import { BasicMinerID, PrecisionPneumaticDrillID, HardenedDrillID, NodeID } from "../prototypes/Tiles.sol";

// resources
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

import { BuildingKey } from "../prototypes/Keys.sol";

// crafted

import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibCraft } from "../libraries/LibCraft.sol";
import { LibClaim } from "../libraries/LibClaim.sol";
import { LibMine } from "../libraries/LibMine.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.ClaimFromMine"));

contract ClaimFromMineSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function claimBuilding(Coord memory coord, uint256 originEntity, uint256 destination) public {
    ClaimComponents memory c = ClaimComponents(
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    LastResearchedAtComponent lastResearchedAtComponent = LastResearchedAtComponent(
      getAddressById(components, LastResearchedAtComponentID)
    );

    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (c.tileComponent.has(entity)) {
      // Check that health is not zero
      require(LibHealth.checkAlive(c.healthComponent, entity), "health is not zero");

      if (entity == originEntity) {
        // Prevent conveyor tiles to re-claim buildings that we originally started claiming from
        // if an infinite loop, the game will just run out of gas.
        return;
      }

      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entity);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // Miners
      if (
        c.tileComponent.getValue(entity) == MinerID ||
        c.tileComponent.getValue(entity) == LithiumMinerID ||
        c.tileComponent.getValue(entity) == BasicMinerID ||
        c.tileComponent.getValue(entity) == PrecisionPneumaticDrillID ||
        c.tileComponent.getValue(entity) == HardenedDrillID
      ) {
        // fetch tile beneath miner, return 0 if resource is not unlocked via LibMine.mine
        uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

        uint256 incBy = LibMine.mine(
          c.lastClaimedAtComponent,
          lastBuiltAtComponent,
          lastResearchedAtComponent,
          ResearchComponent(getAddressById(components, ResearchComponentID)),
          c.tileComponent.getValue(entity),
          resourceKey,
          resourceKey,
          ownerKey,
          entity
        );

        LibMath.incrementBy(
          ItemComponent(getAddressById(components, ItemComponentID)),
          LibEncode.hashKeyEntity(resourceKey, destination),
          incBy
        );
        return;
      }
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function claimAdjacentBuildings(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimBuilding(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  // pass in a coordinate of a conveyor block, which fetches all other
  function claimNodeTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);

    if (
      tileComponent.has(entity) &&
      (tileComponent.getValue(entity) == DebugNodeID || tileComponent.getValue(entity) == NodeID)
    ) {
      // Check that health is not zero
      require(LibHealth.checkAlive(healthComponent, entity), "health is not zero");

      claimAdjacentBuildings(coord, originEntity, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entity);

      // claim each conveyor tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimNodeTile(LibEncode.decodeCoordEntity(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyor nodes.
  function claimAdjacentNodeTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimNodeTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    Coord memory coord = abi.decode(args, (Coord));

    // check if main base
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(c.tileComponent.has(entity), "[ClaimFromMineSystem] Cannot claim from mines on an empty coordinate");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[ClaimFromMineSystem] Cannot claim from mines on a tile you do not own"
    );

    // Check that health is not zero
    require(
      LibHealth.checkAlive(c.healthComponent, entity),
      "[ClaimFromMineSystem] Cannot claim from mines on a tile with zero health"
    );

    uint256 endClaimTime = block.number;
    c.lastClaimedAtComponent.set(entity, endClaimTime);

    // Check main base, if so destination is the wallet
    if (c.tileComponent.getValue(entity) == MainBaseID) {
      claimAdjacentNodeTiles(coord, entity, addressToEntity(msg.sender));
    }
    // store items in claimable factories or weapons store
    else if (LibClaim.isClaimableFactory(c.tileComponent.getValue(entity))) {
      uint256 destination = entity;
      claimAdjacentNodeTiles(coord, entity, destination);
    } else {
      revert("[ClaimFromMineSystem] Cannot store items in selected tile");
    }

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
