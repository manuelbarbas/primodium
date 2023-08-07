pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID, ResourceValues } from "../components/RequiredConnectedProductionComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "../components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "../components/BuildingProductionComponent.sol";
import { PathComponent, ID as PathComponentID } from "../components/PathComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdateConnectedRequiredProduction"));

contract UpdateConnectedRequiredProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID),
      "UpdateConnectedRequiredProductionSystem: Only DestroyPathSystem, BuildPathSystem, DestroySystem can call this function"
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

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    PathComponent pathComponent = PathComponent(getAddressById(world.components(), PathComponentID));
    uint256 toEntity = pathComponent.getValue(buildingEntity);

    RequiredConnectedProductionComponent requiredConnectedProductionComponent = RequiredConnectedProductionComponent(
      getC(RequiredConnectedProductionComponentID)
    );

    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      getC(BuildingProductionComponentID)
    );
    ResourceValues memory requiredProduction = requiredConnectedProductionComponent.getValue(toEntity);
    uint256 productionResourceID = buildingProductionComponent.getValue(buildingIdNewLevel).resource;
    for (uint256 i = 0; i < requiredProduction.resources.length; i++) {
      if (requiredProduction.resources[i] == productionResourceID) {
        if (actionType == EActionType.Build) {
          requiredProduction.values[i]--;
        } else if (actionType == EActionType.Destroy) {
          requiredProduction.values[i]++;
        }
        break;
      }
    }
    requiredConnectedProductionComponent.set(toEntity, requiredProduction);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
