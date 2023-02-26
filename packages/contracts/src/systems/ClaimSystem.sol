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

  function claimMiner(Coord memory coord) public {
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

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == MinerID) {
      // check last claimed at time
      uint256 startClaimTime = lastClaimedAtComponent.getValue(entitiesAtPosition[0]);
      uint256 endClaimTime = block.number;
      uint256 incBy = MINE_COUNT_PER_BLOCK * (startClaimTime - endClaimTime);
      lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

      // fetch tile beneath miner.
      uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

      if (resourceKey == BolutiteID) {
        uint256 cur = resourceComponents.bolutiteResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.bolutiteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == CopperID) {
        uint256 cur = resourceComponents.copperResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.copperResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == IridiumID) {
        uint256 cur = resourceComponents.iridiumResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.iridiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == IronID) {
        uint256 cur = resourceComponents.ironResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.ironResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == KimberliteID) {
        uint256 cur = resourceComponents.kimberliteResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.kimberliteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == LithiumID) {
        uint256 cur = resourceComponents.lithiumResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.lithiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == OsmiumID) {
        uint256 cur = resourceComponents.osmiumResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.osmiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == TungstenID) {
        uint256 cur = resourceComponents.tungstenResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.tungstenResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == UraniniteID) {
        uint256 cur = resourceComponents.uraniniteResourceComponent.getValue(addressToEntity(msg.sender));
        resourceComponents.uraniniteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      }
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function claimAdjacentMiners(Coord memory coord) public {
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    Coord memory coordRight = Coord(coord.x + 1, coord.y);
    Coord memory coordUp = Coord(coord.x, coord.y + 1);
    Coord memory coordDown = Coord(coord.x, coord.y - 1);

    claimMiner(coordLeft);
    claimMiner(coordRight);
    claimMiner(coordUp);
    claimMiner(coordDown);
  }

  // pass in a coordinate of a conveyer block, which fetches all other
  function claimConveyerTile(Coord memory coord) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == ConveyerID) {
      claimAdjacentMiners(coord);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyer tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimConveyerTile(positionComponent.getValue(endAtPositionPaths[i]));
      }
    }
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    // Components
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    Coord memory coord = abi.decode(arguments, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not claim base at empty coord");
    require(tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID);

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    // check all four adjacent tiles
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    Coord memory coordRight = Coord(coord.x + 1, coord.y);
    Coord memory coordUp = Coord(coord.x, coord.y + 1);
    Coord memory coordDown = Coord(coord.x, coord.y - 1);

    claimConveyerTile(coordLeft);
    claimConveyerTile(coordRight);
    claimConveyerTile(coordUp);
    claimConveyerTile(coordDown);

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
