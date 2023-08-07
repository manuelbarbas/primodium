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
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "../components/ActiveComponent.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID } from "../components/RequiredConnectedProductionComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "../components/BuildingProductionComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdatePassiveProduction"));

contract UpdatePassiveProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
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
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(world.components(), PassiveProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(world.getComponent(MaxPassiveComponentID));
    uint256 resourceId = passiveProductionComponent.getValue(buildingLevelEntity).resource;
    uint32 capacityIncrease = passiveProductionComponent.getValue(buildingLevelEntity).value;
    if (actionType == EActionType.Upgrade) {
      capacityIncrease =
        capacityIncrease -
        passiveProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    }

    uint32 newCapacity = LibMath.getSafe(maxPassiveComponent, LibEncode.hashKeyEntity(resourceId, playerEntity));
    if (actionType == EActionType.Destroy) {
      newCapacity -= capacityIncrease;
    } else {
      newCapacity += capacityIncrease;
    }
    maxPassiveComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), newCapacity);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
