// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
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
import { MainBaseID, ConveyorID, MinerID, LithiumMinerID, SiloID } from "../prototypes/Tiles.sol";

// Production Buildings
import { BasicMinerID, PrecisionMachineryFactoryID, HardenedDrillID, NodeID } from "../prototypes/Tiles.sol";

// resources
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

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
      PositionComponent(getAddressById(components, PositionComponentID)),
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

    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (entitiesAtPosition.length == 1) {
      // Check that health is not zero
      require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");

      if (entitiesAtPosition[0] == originEntity) {
        // Prevent conveyor tiles to re-claim buildings that we originally started claiming from
        // if an infinite loop, the game will just run out of gas.
        return;
      }

      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // Miners
      if (
        c.tileComponent.getValue(entitiesAtPosition[0]) == MinerID ||
        c.tileComponent.getValue(entitiesAtPosition[0]) == LithiumMinerID ||
        c.tileComponent.getValue(entitiesAtPosition[0]) == BasicMinerID ||
        c.tileComponent.getValue(entitiesAtPosition[0]) == PrecisionMachineryFactoryID ||
        c.tileComponent.getValue(entitiesAtPosition[0]) == HardenedDrillID
      ) {
        // fetch tile beneath miner, return 0 if resource is not unlocked via LibMine.mine
        uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

        uint256 incBy = LibMine.mine(
          c.lastClaimedAtComponent,
          lastBuiltAtComponent,
          lastResearchedAtComponent,
          ResearchComponent(getAddressById(components, ResearchComponentID)),
          c.tileComponent.getValue(entitiesAtPosition[0]),
          resourceKey,
          resourceKey,
          ownerKey,
          entitiesAtPosition[0]
        );

        LibMath.incrementBy(
          ItemComponent(getAddressById(components, ItemComponentID)),
          LibEncode.hashFromAddress(resourceKey, entityToAddress(destination)),
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
  function claimConveyorTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (
      entitiesAtPosition.length == 1 &&
      (tileComponent.getValue(entitiesAtPosition[0]) == ConveyorID ||
        tileComponent.getValue(entitiesAtPosition[0]) == NodeID)
    ) {
      // Check that health is not zero
      require(LibHealth.checkAlive(healthComponent, entitiesAtPosition[0]), "health is not zero");

      claimAdjacentBuildings(coord, originEntity, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyor tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimConveyorTile(positionComponent.getValue(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyor nodes.
  function claimAdjacentConveyorTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimConveyorTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimConveyorTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimConveyorTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimConveyorTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    Coord memory coord = abi.decode(args, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "[ClaimFromMineSystem] Cannot claim from mines on an empty coordinate");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[ClaimFromMineSystem] Cannot claim from mines on a tile you do not own"
    );

    // Check that health is not zero
    require(
      LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]),
      "[ClaimFromMineSystem] Cannot claim from mines on a tile with zero health"
    );

    uint256 endClaimTime = block.number;
    c.lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

    // Check main base, if so destination is the wallet
    if (c.tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID) {
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], addressToEntity(msg.sender));
    }
    // store items in the Silo for emitting bullets
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == SiloID) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], destination);
    } else if (LibClaim.isClaimableFactory(c.tileComponent.getValue(entitiesAtPosition[0]))) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], destination);
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
