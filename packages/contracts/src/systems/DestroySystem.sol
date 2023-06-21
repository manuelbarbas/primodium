// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";

import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );

    // Check there isn't another tile there
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length < 2, "[DestroySystem] Cannot destroy multiple tiles at once");
    require(entitiesAtPosition.length == 1, "[DestroySystem] Cannot destroy tile at an empty coordinate");

    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(entitiesAtPosition[0])) {
      pathComponent.remove(entitiesAtPosition[0]);
    }

    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);
    if (pathWithEndingTile.length > 0) {
      for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
        pathComponent.remove(pathWithEndingTile[i]);
      }
    }

    // for main base tile, remove main base initialized.
    if (tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );
      mainBaseInitializedComponent.remove(addressToEntity(msg.sender));
    }

    positionComponent.remove(entitiesAtPosition[0]);
    tileComponent.remove(entitiesAtPosition[0]);
    ownedByComponent.remove(entitiesAtPosition[0]);
    lastBuiltAtComponent.remove(entitiesAtPosition[0]);
    lastClaimedAtComponent.remove(entitiesAtPosition[0]);
    buildingComponent.remove(entitiesAtPosition[0]);
    return abi.encode(entitiesAtPosition[0]);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
