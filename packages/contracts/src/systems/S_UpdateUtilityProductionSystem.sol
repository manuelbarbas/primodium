// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as SpawnSystemID } from "./SpawnSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "../components/MaxUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "../components/P_UtilityProductionComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdateUtilityProduction"));

contract S_UpdateUtilityProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), SpawnSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "S_UpdateUtilityProductionSystem: Only BuildSystem, SpawnSystem, UpgradeSystem, DestroySystem can call this function"
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
    P_UtilityProductionComponent UtilityProductionComponent = P_UtilityProductionComponent(
      getAddressById(world.components(), P_UtilityProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(world.getComponent(MaxUtilityComponentID));
    uint256 resourceId = UtilityProductionComponent.getValue(buildingLevelEntity).resource;
    uint32 capacityIncrease = UtilityProductionComponent.getValue(buildingLevelEntity).value;
    if (actionType == EActionType.Upgrade) {
      capacityIncrease =
        capacityIncrease -
        UtilityProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    }

    uint32 newCapacity = LibMath.getSafe(maxUtilityComponent, LibEncode.hashKeyEntity(resourceId, playerEntity));
    if (actionType == EActionType.Destroy) {
      newCapacity -= capacityIncrease;
    } else {
      newCapacity += capacityIncrease;
    }
    maxUtilityComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), newCapacity);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
