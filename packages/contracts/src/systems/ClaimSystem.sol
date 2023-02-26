// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// Resource Components
import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/resources/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/resources/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/resources/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/resources/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/resources/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/resources/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/resources/OsmiumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/resources/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/resources/UraniniteResourceComponent.sol";

import { MainBaseID, MinerID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Claim"));

contract ClaimSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  // TODO: Change rate to be variable based on miner
  uint256 MINE_COUNT_PER_BLOCK = 10;

  // Components
  PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
  TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
  OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
  LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(getAddressById(components, LastBuiltAtComponentID));
  LastClaimedAtComponent lastClaimedAtComponent =
    LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID));

  // Specific Resource Components
  BolutiteResourceComponent bolutiteResourceComponent =
    BolutiteResourceComponent(getAddressById(components, BolutiteResourceComponentID));
  CopperResourceComponent copperResourceComponent =
    CopperResourceComponent(getAddressById(components, CopperResourceComponentID));
  IridiumResourceComponent iridiumResourceComponent =
    IridiumResourceComponent(getAddressById(components, IridiumResourceComponentID));
  IronResourceComponent ironResourceComponent =
    IronResourceComponent(getAddressById(components, IronResourceComponentID));
  KimberliteResourceComponent kimberliteResourceComponent =
    KimberliteResourceComponent(getAddressById(components, KimberliteResourceComponentID));
  LithiumResourceComponent lithiumResourceComponent =
    LithiumResourceComponent(getAddressById(components, LithiumResourceComponentID));
  OsmiumResourceComponent osmiumResourceComponent =
    OsmiumResourceComponent(getAddressById(components, OsmiumResourceComponentID));
  TungstenResourceComponent tungstenResourceComponent =
    TungstenResourceComponent(getAddressById(components, TungstenResourceComponentID));
  UraniniteResourceComponent uraniniteResourceComponent =
    UraniniteResourceComponent(getAddressById(components, UraniniteResourceComponentID));

  function claimMiner(Coord memory coord) public {
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coordLeft);

    if (entitiesAtPosition.length == 1 && tileComponent.getValue(entitiesAtPosition[0]) == MinerID) {
      // fetch tile beneath miner.
      uint256 resourceKey = LibTerrain.getTopLayerKey(coord);

      // check last claimed at time
      uint256 startClaimTime = lastClaimedAtComponent.getValue(entitiesAtPosition[0]);
      uint256 endClaimTime = block.number;
      lastClaimedAtComponent.set(entitiesAtPosition[0], block.number);

      uint256 incBy = MINE_COUNT_PER_BLOCK * (startClaimTime - endClaimTime);

      if (resourceKey == BolutiteID) {
        uint256 cur = bolutiteResourceComponent.getValue(addressToEntity(msg.sender));
        bolutiteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == CopperID) {
        uint256 cur = copperResourceComponent.getValue(addressToEntity(msg.sender));
        copperResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == IridiumID) {
        uint256 cur = iridiumResourceComponent.getValue(addressToEntity(msg.sender));
        iridiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == IronID) {
        uint256 cur = ironResourceComponent.getValue(addressToEntity(msg.sender));
        ironResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == KimberliteID) {
        uint256 cur = kimberliteResourceComponent.getValue(addressToEntity(msg.sender));
        kimberliteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == LithiumID) {
        uint256 cur = lithiumResourceComponent.getValue(addressToEntity(msg.sender));
        lithiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == OsmiumID) {
        uint256 cur = osmiumResourceComponent.getValue(addressToEntity(msg.sender));
        osmiumResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == TungstenID) {
        uint256 cur = tungstenResourceComponent.getValue(addressToEntity(msg.sender));
        tungstenResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      } else if (resourceKey == UraniniteID) {
        uint256 cur = uraniniteResourceComponent.getValue(addressToEntity(msg.sender));
        uraniniteResourceComponent.set(addressToEntity(msg.sender), cur + incBy);
      }
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function getAdjacentMinersClaimable(Coord memory coord) public returns (uint256) {
    Coord memory coordLeft = Coord(coord.x - 1, coord.y);
    Coord memory coordRight = Coord(coord.x + 1, coord.y);
    Coord memory coordUp = Coord(coord.x, coord.y + 1);
    Coord memory coordDown = Coord(coord.x, coord.y - 1);

    claimMiner(coordLeft);
    claimMiner(coordRight);
    claimMiner(coordUp);
    claimMiner(coordDown);
  }

  // pass in a coordinate of a path block, which fetches all other
  function getClaimableResourceCountPath(Coord memory coord) public returns (uint256) {
    // check if tile component
    // connnect to previous path
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(arguments, (uint256, Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not claim base at empty coord");
    require(tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID);

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    // check all four adjacent tiles
    // left tilie
    // for (tile in tiles) {

    // }

    // right tile

    // up tile

    // bottom tile

    // while true:
  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(blockType, coord));
  }
}
