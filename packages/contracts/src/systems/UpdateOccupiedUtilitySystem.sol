// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "../components/P_RequiredUtilityComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "../components/OccupiedUtilityResourceComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.UpdateOccupiedUtility"));

contract UpdateOccupiedUtilitySystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "UpdateUtilityProductionSystem: Only BuildSystem, UpgradeSystem, DestroySystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity, EActionType actionType) = abi.decode(
      args,
      (address, uint256, EActionType)
    );
    uint256 buildingType = BuildingTypeComponent(getAddressById(world.components(), BuildingTypeComponentID)).getValue(
      buildingEntity
    );
    uint32 buildingLevel = LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(
      buildingEntity
    );
    uint256 playerEntity = addressToEntity(playerAddress);
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    OccupiedUtilityResourceComponent occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );

    if (actionType == EActionType.Upgrade) {
      uint256 buildingLastLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
      uint256[] memory resourceIDs = requiredUtilityComponent.getValue(buildingLastLevelEntity).resources;
      uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(buildingLastLevelEntity).values;
      for (uint256 i = 0; i < resourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
        occupiedUtilityResourceComponent.set(
          playerResourceEntity,
          LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) - requiredAmounts[i]
        );
      }
    }
    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
      uint32 requiredAmount = requiredAmounts[i];
      if (actionType == EActionType.Upgrade) {
        requiredAmount -= requiredUtilityComponent
          .getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1))
          .values[i];
      }
      occupiedUtilityResourceComponent.set(
        playerResourceEntity,
        (
          actionType == EActionType.Destroy
            ? (LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) - requiredAmount)
            : (LibMath.getSafe(occupiedUtilityResourceComponent, playerResourceEntity) + requiredAmount)
        )
      );
    }
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
