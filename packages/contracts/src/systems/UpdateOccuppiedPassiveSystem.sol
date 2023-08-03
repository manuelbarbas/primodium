pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { ID as UpdateUnclaimedResourcesSystemID } from "./UpdateUnclaimedResourcesSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { MaxPassiveComponent, ID as MaxPassiveComponentID } from "../components/MaxPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "../components/PassiveProductionComponent.sol";
import { OccupiedPassiveResourceComponent, ID as OccupiedPassiveResourceComponentID } from "../components/OccupiedPassiveResourceComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "../components/ActiveComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "../components/MinesComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "../components/BuildingProductionComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdateOccuppiedPassive"));

contract UpdateOccuppiedPassiveSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "UpdatePassiveProductionSystem: Only BuildSystem, UpgradeSystem, DestroySystem can call this function"
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
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      world.getComponent(RequiredPassiveComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      world.getComponent(OccupiedPassiveResourceComponentID)
    );

    if (actionType == EActionType.Upgrade) {
      uint256 buildingLastLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
      uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLastLevelEntity).resources;
      uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLastLevelEntity).values;
      for (uint256 i = 0; i < resourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
        occupiedPassiveResourceComponent.set(
          playerResourceEntity,
          LibMath.getSafe(occupiedPassiveResourceComponent, playerResourceEntity) - requiredAmounts[i]
        );
      }
    }
    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
      uint32 requiredAmount = requiredAmounts[i];
      if (actionType == Upgrade) {
        requiredAmount -= requiredPassiveComponent
          .getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1))
          .values[i];
      }
      occupiedPassiveResourceComponent.set(
        playerResourceEntity,
        (
          actionType == EActionType.Destroy
            ? (LibMath.getSafe(occupiedPassiveResourceComponent, playerResourceEntity) - requiredAmount)
            : (LibMath.getSafe(occupiedPassiveResourceComponent, playerResourceEntity) + requiredAmount)
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
