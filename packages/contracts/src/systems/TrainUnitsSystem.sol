// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID, ResourceValue } from "components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "components/UnitProductionLastQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";

// libraries
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnits } from "../libraries/LibUnits.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

import { IOnEntityCountSubsystem } from "../interfaces/IOnEntityCountSubsystem.sol";
import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ID as S_UpdatePlayerSpaceRockSystem } from "./S_UpdatePlayerSpaceRockSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";

uint256 constant ID = uint256(keccak256("system.TrainUnits"));

contract TrainUnitsSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingEntity, uint256 unitType, uint32 count) public returns (bytes memory) {
    return execute(abi.encode(buildingEntity, unitType, count));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingEntity, uint256 unitType, uint32 count) = abi.decode(args, (uint256, uint256, uint32));

    uint256 playerEntity = addressToEntity(msg.sender);
    uint32 playerUnitLevel = LibUnits.getPlayerUnitTypeLevel(world, playerEntity, unitType);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(unitType, playerUnitLevel);

    IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystem)).executeTyped(
      msg.sender,
      PositionComponent(getC(PositionComponentID)).getValue(buildingEntity).parent
    );
    require(
      LibUnits.canBuildingProduceUnit(world, buildingEntity, unitType),
      "[TrainUnitsSystem] Building cannot produce unit"
    );

    require(
      LibUnits.checkUtilityResourceReqs(world, playerEntity, unitType, count),
      "[TrainUnitsSystem] You do not have the required Utility resources"
    );

    //check resource requirements and if ok spend required resources
    if (P_RequiredResourcesComponent(getC(P_RequiredResourcesComponentID)).has(unitTypeLevelEntity)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, unitTypeLevelEntity, count),
        "[TrainUnitsSystem] You do not have the required resources"
      );
      IOnEntityCountSubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        unitTypeLevelEntity,
        count
      );
    }

    //Occupied Utility Update
    if (P_RequiredUtilityComponent(getC(P_RequiredUtilityComponentID)).has(unitTypeLevelEntity)) {
      // update occupied utility
      LibUnits.updateOccuppiedUtilityResources(world, playerEntity, unitType, count, true);
    }

    UnitProductionLastQueueIndexComponent unitProductionLastQueueIndexComponent = UnitProductionLastQueueIndexComponent(
      getC(UnitProductionLastQueueIndexComponentID)
    );
    UnitProductionQueueIndexComponent unitProductionQueueIndexComponent = UnitProductionQueueIndexComponent(
      getC(UnitProductionQueueIndexComponentID)
    );

    uint32 queueIndex = 0;
    if (unitProductionQueueIndexComponent.has(buildingEntity)) {
      queueIndex = unitProductionLastQueueIndexComponent.getValue(buildingEntity) + 1;
    } else {
      unitProductionQueueIndexComponent.set(buildingEntity, queueIndex);
    }

    unitProductionLastQueueIndexComponent.set(buildingEntity, queueIndex);
    uint256 buildingQueueEntity = LibEncode.hashKeyEntity(buildingEntity, queueIndex);

    UnitProductionQueueComponent(getC(UnitProductionQueueComponentID)).set(
      buildingQueueEntity,
      ResourceValue({ resource: unitType, value: count })
    );

    return abi.encode(buildingEntity);
  }
}
