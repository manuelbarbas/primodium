// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// Resource Components
import { ResourceComponents } from "../prototypes/ResourceComponents.sol";
import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/OsmiumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/UraniniteResourceComponent.sol";

import { MainBaseID, MinerID, ConveyerID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Claim"));

contract ClaimSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  // TODO: Change rate to be variable based on miner
  uint256 MINE_COUNT_PER_BLOCK = 10;

  function claimMiner(Coord memory coord, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );

    ResourceComponents memory resourceComponents = ResourceComponents(
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

    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == MinerID) {
      // Check that the coordinates is owned by the msg.sender
      uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtPosition[0]);

      // "can not claim resource at not owned tile"
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // check last claimed at time
      uint256 startClaimTime = lastClaimedAtComponent.getValue(entitiesAtPosition[0]);
      uint256 endClaimTime = block.number;
      uint256 incBy = MINE_COUNT_PER_BLOCK * (endClaimTime - startClaimTime);
      lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

      // fetch tile beneath miner.
      uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

      if (resourceKey == BolutiteID) {
        uint256 cur = resourceComponents.bolutiteResourceComponent.has(destination)
          ? resourceComponents.bolutiteResourceComponent.getValue(destination)
          : 0;
        resourceComponents.bolutiteResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == CopperID) {
        uint256 cur = resourceComponents.copperResourceComponent.has(destination)
          ? resourceComponents.copperResourceComponent.getValue(destination)
          : 0;
        resourceComponents.copperResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == IridiumID) {
        uint256 cur = resourceComponents.iridiumResourceComponent.has(destination)
          ? resourceComponents.iridiumResourceComponent.getValue(destination)
          : 0;
        resourceComponents.iridiumResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == IronID) {
        uint256 cur = resourceComponents.ironResourceComponent.has(destination)
          ? resourceComponents.ironResourceComponent.getValue(destination)
          : 0;
        resourceComponents.ironResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == KimberliteID) {
        uint256 cur = resourceComponents.kimberliteResourceComponent.has(destination)
          ? resourceComponents.kimberliteResourceComponent.getValue(destination)
          : 0;
        resourceComponents.kimberliteResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == LithiumID) {
        uint256 cur = resourceComponents.lithiumResourceComponent.has(destination)
          ? resourceComponents.lithiumResourceComponent.getValue(destination)
          : 0;
        resourceComponents.lithiumResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == OsmiumID) {
        uint256 cur = resourceComponents.osmiumResourceComponent.has(destination)
          ? resourceComponents.osmiumResourceComponent.getValue(destination)
          : 0;
        resourceComponents.osmiumResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == TungstenID) {
        uint256 cur = resourceComponents.tungstenResourceComponent.has(destination)
          ? resourceComponents.tungstenResourceComponent.getValue(destination)
          : 0;
        resourceComponents.tungstenResourceComponent.set(ownerKey, cur + incBy);
      } else if (resourceKey == UraniniteID) {
        uint256 cur = resourceComponents.uraniniteResourceComponent.has(destination)
          ? resourceComponents.uraniniteResourceComponent.getValue(destination)
          : 0;
        resourceComponents.uraniniteResourceComponent.set(ownerKey, cur + incBy);
      }
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function claimAdjacentMiners(Coord memory coord, uint256 destination) public {
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    Coord memory coordRight = Coord(coord.x + 1, coord.y);
    Coord memory coordUp = Coord(coord.x, coord.y + 1);
    Coord memory coordDown = Coord(coord.x, coord.y - 1);

    claimMiner(coordLeft, destination);
    claimMiner(coordRight, destination);
    claimMiner(coordUp, destination);
    claimMiner(coordDown, destination);
  }

  // pass in a coordinate of a conveyer block, which fetches all other
  function claimConveyerTile(Coord memory coord, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == ConveyerID) {
      claimAdjacentMiners(coord, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyer tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimConveyerTile(positionComponent.getValue(endAtPositionPaths[i]), destination);
      }
    }
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    // Components
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );

    Coord memory coord = abi.decode(arguments, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not claim base at empty coord");
    require(tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID);

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    uint256 endClaimTime = block.number;
    lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

    // destination is either a wallet (store item in wallet-specific global inventory) or entity ID (store item in entity, eg within a factory)
    uint256 destination = addressToEntity(msg.sender);

    // check all four adjacent tiles
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    Coord memory coordRight = Coord(coord.x + 1, coord.y);
    Coord memory coordUp = Coord(coord.x, coord.y + 1);
    Coord memory coordDown = Coord(coord.x, coord.y - 1);

    claimConveyerTile(coordLeft, destination);
    claimConveyerTile(coordRight, destination);
    claimConveyerTile(coordUp, destination);
    claimConveyerTile(coordDown, destination);

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
