// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingLevelComponent, ID as BuildingComponentID } from "components/BuildingLevelComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";

// types
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID, RequiredPassiveResourceData } from "components/RequiredPassiveResourceComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID } from "components/PassiveResourceProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { ID as PostDestroyPathSystemID } from "./PostDestroyPathSystem.sol";
import { ID as PostDestroySystemID } from "./PostDestroySystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function checkPassiveResourceRequirementsMetAfterDestroy(uint256 blockType) internal view returns (bool) {
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(components, PassiveResourceProductionComponentID)
    );
    if (passiveResourceProductionComponent.has(blockType)) {
      return
        LibStorage.getAvailableSpaceInStorageForResource(
          StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
          ItemComponent(getAddressById(components, ItemComponentID)),
          addressToEntity(msg.sender),
          passiveResourceProductionComponent.getValue(blockType).ResourceID
        ) >= passiveResourceProductionComponent.getValue(blockType).ResourceProduction;
    }
    return true;
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    PathComponent pathComponent = PathComponent(getC(PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    BuildingTilesComponent buildingTilesComponent = BuildingTilesComponent(getC(BuildingTilesComponentID));

    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );

    uint256 buildingEntity = getBuildingFromCoord(coord);
    uint256 playerEntity = addressToEntity(msg.sender);
    uint256 buildingType = tileComponent.getValue(buildingEntity);
    require(
      checkPassiveResourceRequirementsMetAfterDestroy(buildingType),
      "[DestroySystem] can not destory passive resource production building if requirements are not met, destroy passive resource consumers first or increase passive resource production"
    );

    require(ownedByComponent.getValue(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntity);
    buildingTilesComponent.remove(buildingEntity);
    for (uint i = 0; i < buildingTiles.length; i++) {
      clearBuildingTile(ownedByComponent, buildingTiles[i]);
    }
    buildingTilesComponent.remove(buildingEntity);
    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(buildingEntity)) {
      IOnEntitySubsystem(getAddressById(world.systems(), PostDestroyPathSystemID)).executeTyped(
        msg.sender,
        buildingEntity
      );
      pathComponent.remove(buildingEntity);
    }

    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(buildingEntity);
    if (pathWithEndingTile.length > 0) {
      for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
        IOnEntitySubsystem(getAddressById(world.systems(), PostDestroyPathSystemID)).executeTyped(
          msg.sender,
          pathWithEndingTile[i]
        );
        pathComponent.remove(pathWithEndingTile[i]);
      }
    }

    // for main base tile, remove main base initialized.
    if (buildingType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );
      mainBaseInitializedComponent.remove(playerEntity);
    }

    if (!IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)).has(buildingType)) {
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint32Value(buildingLimitComponent, playerEntity) - 1);
    }

    IOnEntitySubsystem(getAddressById(world.systems(), PostDestroySystemID)).executeTyped(msg.sender, buildingEntity);

    buildingLevelComponent.remove(buildingEntity);
    tileComponent.remove(buildingEntity);
    ownedByComponent.remove(buildingEntity);
    LastClaimedAtComponent(getC(LastClaimedAtComponentID)).remove(buildingEntity);
    buildingTilesComponent.remove(buildingEntity);
    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }

  function clearBuildingTile(OwnedByComponent ownedByComponent, uint256 tileEntity) private {
    require(ownedByComponent.has(tileEntity), "[DestroySystem] Cannot destroy unowned coordinate");
    ownedByComponent.remove(tileEntity);
  }
}
