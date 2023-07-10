// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

// components
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";

// types
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey, BuildingTileKey } from "../prototypes/Keys.sol";
import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 buildingEntity = abi.decode(args, (uint256));
    PathComponent pathComponent = PathComponent(getC(PathComponentID));
    BuildingTilesComponent buildingTilesComponent = BuildingTilesComponent(getC(BuildingTilesComponentID));
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID));
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
    TileComponent tileComponent = TileComponent(getC(TileComponentID));

    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));

    uint256 playerEntity = addressToEntity(msg.sender);

    require(ownedByComponent.getValue(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntity);
    for (uint i = 0; i < buildingTiles.length; i++) {
      clearBuildingTile(tileComponent, buildingTiles[i]);
    }
    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(buildingEntity)) {
      pathComponent.remove(buildingEntity);
    }
    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(buildingEntity);
    for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
      pathComponent.remove(pathWithEndingTile[i]);
    }

    uint256 buildingType = tileComponent.getValue(buildingEntity);

    // for main base tile, remove main base initialized.
    if (buildingType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );
      mainBaseInitializedComponent.remove(playerEntity);
    }

    if (!ignoreBuildLimitComponent.has(buildingType)) {
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) - 1);
    }

    tileComponent.remove(buildingEntity);
    BuildingComponent(getC(BuildingComponentID)).remove(buildingEntity);
    ownedByComponent.remove(buildingEntity);
    LastBuiltAtComponent(getC(LastBuiltAtComponentID)).remove(buildingEntity);
    LastClaimedAtComponent(getC(LastClaimedAtComponentID)).remove(buildingEntity);

    return abi.encode(buildingEntity);
  }

  function executeTyped(uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(buildingEntity));
  }

  function clearBuildingTile(Uint256Component tileComponent, uint256 tileEntity) private {
    require(tileComponent.has(tileEntity), "[DestroySystem] Cannot destroy tile at an empty coordinate");
    tileComponent.remove(tileEntity);
    OwnedByComponent(getC(OwnedByComponentID)).remove(tileEntity);
  }
}
