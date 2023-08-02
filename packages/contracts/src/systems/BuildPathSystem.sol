// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { Coord } from "../types.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { ID as BuildPathFromFactoryToMainBaseSystemID } from "./BuildPathFromFactoryToMainBaseSystem.sol";
import { ID as BuildPathFromMineToMainBaseSystemID } from "./BuildPathFromMineToMainBaseSystem.sol";
import { ID as BuildPathFromMineToFactorySystemID } from "./BuildPathFromMineToFactorySystem.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function updateResourceClaimed(uint256 playerEntity, uint256 startBuilding) internal {
    LibUnclaimedResource.updateResourceClaimed(
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
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    uint256 startCoordBuildingId = buildingTypeComponent.getValue(startBuilding);
    uint256 endCoordBuildingId = buildingTypeComponent.getValue(endBuilding);
    uint256 startCoordLevelEntity = LibEncode.hashKeyEntity(
      startCoordBuildingId,
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(startBuilding)
    );

    if (MinesComponent(getAddressById(components, MinesComponentID)).has(startCoordLevelEntity)) {
      require(
        endCoordBuildingId == MainBaseID,
        "[BuildPathSystem] Cannot build path from a factory to any building other then MainBase"
      );
      IOnTwoEntitySubsystem(getAddressById(world.systems(), BuildPathFromFactoryToMainBaseSystemID)).executeTyped(
        msg.sender,
        startBuilding,
        endBuilding
      );
    } else if (ProductionComponent(getAddressById(components, ProductionComponentID)).has(startCoordLevelEntity)) {
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
    }
    return abi.encode(startBuilding);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
