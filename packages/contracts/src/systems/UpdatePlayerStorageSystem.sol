pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";

import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdatePlayerStorage"));

contract UpdatePlayerStorageSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "UpdatePlayerStorageSystem: Only BuildSystem, UpgradeSystem, DestroySystem can call this function"
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

    LibStorage.updatePlayerStorage(world, playerEntity, buildingType, buildingLevel, actionType == EActionType.Destroy);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
