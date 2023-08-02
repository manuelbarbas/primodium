pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";

import { IOnBuildingSubsystem } from "../interfaces/IOnBuildingSubsystem.sol";

import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdatePlayerResourceProduction"));

contract UpdatePlayerResourceProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID),
      "UpdatePlayerResourceProductionSystem: Only BuildSystem, UpgradeSystem, DestroySystem, BuildPathSystem and DestroyPathSystem can call this function"
    );

    (address playerAddress, uint256 buildingType, uint32 buildingLevel, bool isDestroy) = abi.decode(
      args,
      (address, uint256, uint32, bool)
    );
    uint256 playerEntity = addressToEntity(playerAddress);

    LibStorage.updatePlayerStorage(world, playerEntity, buildingType, buildingLevel, isDestroy);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingType,
    uint32 buildingLevel,
    bool isDestroy
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingType, buildingLevel, isDestroy));
  }
}
