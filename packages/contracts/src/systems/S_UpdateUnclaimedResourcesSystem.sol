// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import "solecs/SingletonID.sol";
import { ID as UpdatePlayerStorageSystemID } from "systems/S_UpdatePlayerStorageSystem.sol";
import { ID as UpdatePlayerResourceProductionSystemID } from "systems/S_UpdatePlayerResourceProductionSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "systems/S_SpendRequiredResourcesSystem.sol";
import { ID as ClaimFromMineSystemID } from "systems/ClaimFromMineSystem.sol";
import { ID as UpdatePlayerSpaceRockSystemID } from "systems/S_UpdatePlayerSpaceRockSystem.sol";
// components
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { PlayerMotherlodeComponent, ID as PlayerMotherlodeComponentID } from "components/PlayerMotherlodeComponent.sol";
import { P_WorldSpeedComponent, ID as P_WorldSpeedComponentID, SPEED_SCALE } from "components/P_WorldSpeedComponent.sol";
// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdateUnclaimedResources"));

contract S_UpdateUnclaimedResourcesSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
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
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    uint32 playerResourceProduction = LibMath.getSafe(productionComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return abi.encode(resourceID);
    }
    uint256 blocksPassed = block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceProductionEntity);
    blocksPassed =
      (blocksPassed * SPEED_SCALE) /
      LibMath.getSafe(P_WorldSpeedComponent(world.getComponent(P_WorldSpeedComponentID)), SingletonID);
    uint32 unclaimedResource = uint32(playerResourceProduction * blocksPassed);

    unclaimedResource = LibStorage.addResourceToStorage(world, playerEntity, resourceID, unclaimedResource);
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);

    uint256[] memory motherlodes = PlayerMotherlodeComponent(world.getComponent(PlayerMotherlodeComponentID))
      .getEntitiesWithValue(playerResourceProductionEntity);
    for (uint256 i = 0; i < motherlodes.length; i++) {
      IOnEntitySubsystem(getAddressById(world.systems(), UpdatePlayerSpaceRockSystemID)).executeTyped(
        playerAddress,
        motherlodes[i]
      );
    }

    return abi.encode(unclaimedResource);
  }

  function executeTyped(address playerAddress, uint256 resourceID) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, resourceID));
  }
}
