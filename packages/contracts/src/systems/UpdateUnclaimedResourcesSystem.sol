// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as UpdatePlayerStorageSystemID } from "systems/UpdatePlayerStorageSystem.sol";
import { ID as UpdatePlayerResourceProductionSystemID } from "systems/UpdatePlayerResourceProductionSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "systems/SpendRequiredResourcesSystem.sol";
import { ID as ClaimFromMineSystemID } from "systems/ClaimFromMineSystem.sol";
// components
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID, ResourceValues } from "components/RequiredConnectedProductionComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.UpdateUnclaimedResources"));

contract UpdateUnclaimedResourcesSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), UpdatePlayerStorageSystemID) ||
        msg.sender == getAddressById(world.systems(), UpdatePlayerResourceProductionSystemID) ||
        msg.sender == getAddressById(world.systems(), SpendRequiredResourcesSystemID) ||
        msg.sender == getAddressById(world.systems(), ClaimFromMineSystemID),
      "UpdateUnclaimedResourcesSystem: Only UpdatePlayerStorageSystem, UpdatePlayerResourceProductionSystem, SpendRequiredResourcesSystem, ClaimFromMineSystemID  can call this function"
    );

    (address playerAddress, uint256 resourceID) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceID, playerEntity);
    if (!lastClaimedAtComponent.has(playerResourceProductionEntity)) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return abi.encode(resourceID);
    } else if (lastClaimedAtComponent.getValue(playerResourceProductionEntity) == block.number) {
      return abi.encode(resourceID);
    }
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );
    uint32 playerResourceProduction = LibMath.getSafe(playerProductionComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return abi.encode(resourceID);
    }

    uint32 availableSpaceInStorage = LibStorage.getResourceStorageSpace(world, playerEntity, resourceID);
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return abi.encode(resourceID);
    }
    uint32 unclaimedResource = (playerResourceProduction *
      uint32(block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceProductionEntity)));

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    itemComponent.set(
      playerResourceProductionEntity,
      LibMath.getSafe(itemComponent, playerResourceProductionEntity) + unclaimedResource
    );
    return abi.encode(resourceID);
  }

  function executeTyped(address playerAddress, uint256 resourceID) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, resourceID));
  }
}
