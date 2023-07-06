// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";

import { DebugNodeID, NodeID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibPath } from "../libraries/LibPath.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";

uint256 constant ID = uint256(keccak256("system.DestroyPath"));

contract DestroyPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    uint256 playerEntity,
    uint256 startCoordEntity
  ) internal {
    LibNewMine.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startCoordEntity))
    );
  }

  function updateResourceProductionOnDestroyPathFromMine(
    MineComponent mineComponent,
    TileComponent tileComponent,
    uint256 fromEntity
  ) internal {
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    LibNewMine.updateResourceProductionOnDestroyPathFromMine(
      mineComponent,
      buildingComponent,
      tileComponent,
      addressToEntity(msg.sender),
      fromEntity
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coordStart = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    // Check that the coordinates exist tiles
    uint256 startCoordEntity = LibEncode.encodeCoordEntity(coordStart, BuildingKey);
    require(tileComponent.has(startCoordEntity), "[DestroyPathSystem] Cannot destroy path from an empty coordinate");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(startCoordEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[DestroyPathSystem] Cannot destroy path from a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(ownedByComponent.has(startCoordEntity), "[DestroyPathSystem] Path does not exist at the selected tile");
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    // update unclaimed resources
    updateUnclaimedForResource(mineComponent, addressToEntity(msg.sender), startCoordEntity);
    //update resource production
    updateResourceProductionOnDestroyPathFromMine(mineComponent, tileComponent, startCoordEntity);
    // remove key
    pathComponent.remove(startCoordEntity);

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart) public returns (bytes memory) {
    return execute(abi.encode(coordStart));
  }
}
