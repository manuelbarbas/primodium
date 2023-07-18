// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { ID as BuildPathFromFactoryToMainBaseSystemID } from "./BuildPathFromFactoryToMainBaseSystem.sol";
import { ID as BuildPathFromMineToMainBaseSystemID } from "./BuildPathFromMineToMainBaseSystem.sol";
import { ID as BuildPathFromMineToFactorySystemID } from "./BuildPathFromMineToFactorySystem.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function updateUnclaimedForResource(uint256 playerEntity, uint256 startBuilding) internal {
    LibUnclaimedResource.updateUnclaimedForResource(
      world,
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startBuilding))
    );
  }

  function checkOwnership(uint256 fromEntity, uint256 toEntity) internal view returns (bool) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    return
      ownedByComponent.getValue(fromEntity) == addressToEntity(msg.sender) &&
      ownedByComponent.getValue(toEntity) == addressToEntity(msg.sender);
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(args, (Coord, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256 startBuilding = getBuildingFromCoord(coordStart);
    uint256 endBuilding = getBuildingFromCoord(coordEnd);

    // Check that the coordinates are both owned by the msg.sender
    require(checkOwnership(startBuilding, endBuilding), "[BuildPathSystem] Cannot build path on unowned tiles");

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !PathComponent(getC(PathComponentID)).has(startBuilding),
      "[BuildPathSystem] Cannot start more than one path from the same building"
    );

    uint256 startCoordBuildingId = tileComponent.getValue(startBuilding);
    uint256 endCoordBuildingId = tileComponent.getValue(endBuilding);
    uint256 startCoordBuildingLevelEntity = LibEncode.hashKeyEntity(
      startCoordBuildingId,
      BuildingLevelComponent(getAddressById(components, BuildingLevelComponentID)).getValue(startBuilding)
    );

    if (MineComponent(getAddressById(components, MineComponentID)).has(startCoordBuildingLevelEntity)) {
      if (endCoordBuildingId == MainBaseID) {
        IOnTwoEntitySubsystem(getAddressById(world.systems(), BuildPathFromMineToMainBaseSystemID)).executeTyped(
          msg.sender,
          startBuilding,
          endBuilding
        );
      } else {
        IOnTwoEntitySubsystem(getAddressById(world.systems(), BuildPathFromMineToFactorySystemID)).executeTyped(
          msg.sender,
          startBuilding,
          endBuilding
        );
      }
    } else if (
      FactoryMineBuildingsComponent(getAddressById(components, FactoryMineBuildingsComponentID)).has(
        startCoordBuildingLevelEntity
      )
    ) {
      require(
        endCoordBuildingId == MainBaseID,
        "[BuildPathSystem] Cannot build path from a factory to any building other then MainBase"
      );
      IOnTwoEntitySubsystem(getAddressById(world.systems(), BuildPathFromFactoryToMainBaseSystemID)).executeTyped(
        msg.sender,
        startBuilding,
        endBuilding
      );
    }

    return abi.encode(startBuilding);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
