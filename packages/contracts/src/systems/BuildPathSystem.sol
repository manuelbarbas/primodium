// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID, ResourceValue } from "components/BuildingProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { Coord } from "../types.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { ID as UpdateConnectedRequiredProductionSystemID } from "./UpdateConnectedRequiredProductionSystem.sol";
import { ID as BuildPathFromFactoryToMainBaseSystemID } from "./BuildPathFromFactoryToMainBaseSystem.sol";
import { ID as BuildPathFromMineToMainBaseSystemID } from "./BuildPathFromMineToMainBaseSystem.sol";
import { ID as BuildPathFromMineToFactorySystemID } from "./BuildPathFromMineToFactorySystem.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function checkOwnership(uint256 fromEntity, uint256 toEntity) internal view returns (bool) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    return
      ownedByComponent.getValue(fromEntity) == addressToEntity(msg.sender) &&
      ownedByComponent.getValue(toEntity) == addressToEntity(msg.sender);
  }

  function canBuildPath(uint256 fromEntity, uint256 toEntity) internal returns (bool) {
    ActiveComponent activeComponent = ActiveComponent(getC(ActiveComponentID));
    LevelComponent levelComponent = LevelComponent(getC(LevelComponentID));
    MinesComponent minesComponent = MinesComponent(getC(MinesComponentID));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(getC(BuildingTypeComponentID));

    uint256 fromEntityBuildingTypeLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(fromEntity),
      levelComponent.getValue(fromEntity)
    );

    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      getC(BuildingProductionComponentID)
    );
    //can only build path from production buildings
    if (!buildingProductionComponent.has(fromEntityBuildingTypeLevelEntity)) return false;
    //can always build path from production buildings to MainBase
    if (buildingTypeComponent.getValue(toEntity) == MainBaseID) return true;

    uint256 toEntityBuildingTypeLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(toEntity),
      levelComponent.getValue(toEntity)
    );
    //can only build path from production buildings to buildings that require production buildings
    if (!minesComponent.has(toEntityBuildingTypeLevelEntity)) return false;

    //can not build path to a building which requires production buildinsg and is active
    if (activeComponent.has(toEntity)) return false;

    //check to see if there is
    ResourceValues memory requiredProduction = minesComponent.getValue(toEntity);
    for (uint256 i = 0; i < requiredProduction.values.length; i++) {
      if (
        requiredProduction.resources[i] ==
        buildingProductionComponent.getValue(fromEntityBuildingTypeLevelEntity).resource
      ) {
        if (requiredProduction.values[i] <= 0) return false;
        return true;
      }
    }
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(args, (Coord, Coord));

    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256 fromEntity = getBuildingFromCoord(coordStart);
    uint256 toEntity = getBuildingFromCoord(coordEnd);

    // Check that the coordinates are both owned by the msg.sender
    require(checkOwnership(fromEntity, toEntity), "[BuildPathSystem] Cannot build path on unowned tiles");

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !PathComponent(getC(PathComponentID)).has(fromEntity),
      "[BuildPathSystem] Cannot start more than one path from the same building"
    );

    require(canBuildPath(fromEntity, toEntity), "[BuildPathSystem] Cannot build path");

    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    uint256 fromBuildingType = buildingTypeComponent.getValue(fromEntity);
    uint256 toBuildingType = buildingTypeComponent.getValue(toEntity);
    uint256 fromBuildingTypeLevelEntity = LibEncode.hashKeyEntity(
      fromBuildingType,
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(fromEntity)
    );
    uint256 toBuildingTypeLevelEntity = LibEncode.hashKeyEntity(
      toBuildingType,
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(toEntity)
    );
    PathComponent(getC(PathComponentID)).set(fromEntity, toEntity);

    MinesComponent minesComponent = MinesComponent(getC(MinesComponentID));
    if (minesComponent.hasValue(toEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateConnectedRequiredProductionSystemID)).executeTyped(
        msg.sender,
        toEntity,
        EActionType.Build
      );
    }

    //Resource Production Update
    if (
      BuildingProductionComponent(getAddressById(components, BuildingProductionComponentID)).has(buildingLevelEntity)
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateActiveStatusSystemID)).executeTyped(
        msg.sender,
        fromEntity,
        EActionType.Build
      );
    }

    return abi.encode(fromEntity);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
