// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID, ResourceValues } from "components/P_ProductionDependenciesComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID, ResourceValue } from "components/P_ProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { Coord } from "../types.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { ID as UpdateConnectedRequiredProductionSystemID } from "./UpdateConnectedRequiredProductionSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
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

  function canBuildPath(uint256 fromEntity, uint256 toEntity) internal view returns (bool) {
    LevelComponent levelComponent = LevelComponent(getC(LevelComponentID));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(getC(BuildingTypeComponentID));

    uint256 fromTypeLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(fromEntity),
      levelComponent.getValue(fromEntity)
    );

    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(getC(P_ProductionComponentID));
    //can only build path from production buildings
    if (!buildingProductionComponent.has(fromTypeLevelEntity)) return false;
    //can always build path from production buildings to MainBase
    if (buildingTypeComponent.getValue(toEntity) == MainBaseID) return true;

    uint256 toTypeLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(toEntity),
      levelComponent.getValue(toEntity)
    );
    //can only build path from production buildings to buildings that require production buildings
    P_ProductionDependenciesComponent requiredConnectedProductionComponent = P_ProductionDependenciesComponent(
      getC(P_ProductionDependenciesComponentID)
    );
    if (!requiredConnectedProductionComponent.has(toTypeLevelEntity)) return false;

    //can not build path to an active production building

    ActiveComponent activeComponent = ActiveComponent(getC(ActiveComponentID));
    if (activeComponent.has(toEntity)) return false;

    //check to see if required production is met
    ResourceValues memory requiredProduction = requiredConnectedProductionComponent.getValue(toEntity);
    for (uint256 i = 0; i < requiredProduction.values.length; i++) {
      if (requiredProduction.resources[i] == buildingProductionComponent.getValue(fromTypeLevelEntity).resource) {
        return requiredProduction.values[i] > 0;
      }
    }
    return false;
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

    uint256 fromBuildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      fromEntity
    );

    uint256 fromBuildingTypeLevelEntity = LibEncode.hashKeyEntity(
      fromBuildingType,
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(fromEntity)
    );

    PathComponent(getC(PathComponentID)).set(fromEntity, toEntity);

    P_ProductionDependenciesComponent requiredConnectedProductionComponent = P_ProductionDependenciesComponent(
      getC(P_ProductionDependenciesComponentID)
    );
    if (requiredConnectedProductionComponent.has(toEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateConnectedRequiredProductionSystemID)).executeTyped(
        msg.sender,
        fromEntity,
        EActionType.Build
      );
    }

    //Resource Production Update
    if (P_ProductionComponent(getAddressById(components, P_ProductionComponentID)).has(fromBuildingTypeLevelEntity)) {
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
