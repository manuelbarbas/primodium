// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, entityToAddress } from "solecs/utils.sol";
import "solecs/SingletonID.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ScoreComponent, ID as ScoreComponentID } from "components/ScoreComponent.sol";
import { P_ScoreMultiplierComponent, ID as P_ScoreMultiplierComponentID } from "components/P_ScoreMultiplierComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_WorldSpeedComponent, ID as P_WorldSpeedComponentID, SPEED_SCALE } from "components/P_WorldSpeedComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues, ResourceValue } from "../types.sol";

import { TitaniumResourceItemID, PlatinumResourceItemID, IridiumResourceItemID, KimberliteResourceItemID } from "../prototypes/Item.sol";

import { PlayerMotherlodeComponent, ID as PlayerMotherlodeComponentID } from "../components/PlayerMotherlodeComponent.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "../systems/S_UpdateUnclaimedResourcesSystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { LibUpdateSpaceRock } from "./LibUpdateSpaceRock.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function hasRequiredResources(
    IWorld world,
    uint256 playerEntity,
    uint256 entity,
    uint32 count
  ) internal view returns (bool) {
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    uint256 worldSpeed = P_WorldSpeedComponent(world.getComponent(P_WorldSpeedComponentID)).getValue(SingletonID);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint32 resourceCost = requiredResources.values[i] * count;
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
      uint32 playerResourceCount = LibMath.getSafe(itemComponent, playerResourceEntity);
      if (resourceCost <= playerResourceCount) continue;
      // uint256 blocksPassed = block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceEntity);
      // blocksPassed = (blocksPassed * SPEED_SCALE) / worldSpeed;
      if (LibMath.getSafe(productionComponent, playerResourceEntity) > 0) {
        playerResourceCount +=
          productionComponent.getValue(playerResourceEntity) *
          uint32(
            ((block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceEntity)) * SPEED_SCALE) / worldSpeed
          );
      }
      if (resourceCost <= playerResourceCount) continue;

      playerResourceCount += getTotalUnclaimedMotherlodeResources(
        world,
        playerEntity,
        requiredResources.resources[i],
        block.number
      );
      if (resourceCost > playerResourceCount) {
        return false;
      }
    }
    return true;
  }

  function getTotalUnclaimedMotherlodeResources(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceEntity,
    uint256 blockNumber
  ) internal view returns (uint32) {
    PlayerMotherlodeComponent playerMotherlodeComponent = PlayerMotherlodeComponent(
      world.getComponent(PlayerMotherlodeComponentID)
    );
    uint256[] memory motherlodes = playerMotherlodeComponent.getEntitiesWithValue(
      LibEncode.hashKeyEntity(resourceEntity, playerEntity)
    );
    uint32 totalUnclaimedResources = 0;
    for (uint256 i = 0; i < motherlodes.length; i++) {
      totalUnclaimedResources += LibUpdateSpaceRock.getUnclaimedMotherlodeResourceAmount(
        world,
        playerEntity,
        motherlodes[i],
        blockNumber
      );
    }
    return totalUnclaimedResources;
  }

  function getTotalResources(
    IWorld world,
    uint256 playerEntity
  ) internal view returns (uint32 totalResources, uint32[] memory resources) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    //hotfix
    uint256[] memory storageResourceIds = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    ).getValue(playerEntity);

    //uint256[] memory storageResourceIds = getMotherlodeResources();
    resources = new uint32[](storageResourceIds.length);
    totalResources = 0;
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 resourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      resources[i] = LibMath.getSafe(itemComponent, resourceEntity);
      totalResources += resources[i];
    }
    return (totalResources, resources);
  }

  function claimAllResources(IWorld world, uint256 playerEntity) internal {
    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );
    if (!maxResourceStorageComponent.has(playerEntity)) return;
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    uint256[] memory storageResourceIds = maxResourceStorageComponent.getValue(playerEntity);
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (ProductionComponent(world.getComponent(ProductionComponentID)).has(playerResourceEntity)) {
        IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
          msg.sender,
          storageResourceIds[i]
        );
      }
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
    }
  }

  function getMotherlodeResources() internal pure returns (uint256[] memory resourceIds) {
    resourceIds = new uint256[](4);
    resourceIds[0] = TitaniumResourceItemID;
    resourceIds[1] = PlatinumResourceItemID;
    resourceIds[2] = IridiumResourceItemID;
    resourceIds[3] = KimberliteResourceItemID;
    return resourceIds;
  }

  function updateResourceAmount(IWorld world, uint256 entity, uint256 resourceType, uint32 value) internal {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    ScoreComponent scoreComponent = ScoreComponent(world.getComponent(ScoreComponentID));
    uint256 resourceEntity = LibEncode.hashKeyEntity(resourceType, entity);
    uint32 currentAmount = LibMath.getSafe(itemComponent, resourceEntity);
    uint256 currentScore = LibMath.getSafe(scoreComponent, entity);
    uint256 scoreChangeAmount = LibMath.getSafe(
      P_ScoreMultiplierComponent(world.getComponent(P_ScoreMultiplierComponentID)),
      resourceType
    );
    if (value < currentAmount) {
      scoreChangeAmount *= (currentAmount - value);
      if (scoreChangeAmount > currentScore) {
        scoreChangeAmount = currentScore;
      }
      currentScore -= scoreChangeAmount;
    } else {
      scoreChangeAmount *= (value - currentAmount);
      currentScore += scoreChangeAmount;
    }
    scoreComponent.set(entity, currentScore);
    itemComponent.set(resourceEntity, value);
  }

  function checkResourceProductionRequirements(
    IWorld world,
    uint256 playerEntity,
    uint256 entityType,
    uint32 level
  ) internal view returns (bool) {
    P_ProductionDependenciesComponent productionDependenciesComponent = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    );
    uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);

    if (!productionDependenciesComponent.has(entityTypeLevelEntity)) return true;

    uint256 entityTypeLasteLevelEntity;

    ResourceValues memory requiredProductions = productionDependenciesComponent.getValue(entityTypeLevelEntity);
    ResourceValues memory lastLevelRequiredProductions;
    if (level > 1) {
      entityTypeLasteLevelEntity = LibEncode.hashKeyEntity(entityType, level - 1);
      lastLevelRequiredProductions = productionDependenciesComponent.getValue(entityTypeLasteLevelEntity);
    }
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    for (uint256 i = 0; i < requiredProductions.resources.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredProductions.resources[i], playerEntity);
      if (!productionComponent.has(playerResourceEntity)) return false;
      uint256 requiredValue = requiredProductions.values[i];
      if (level > 1) {
        requiredValue -= lastLevelRequiredProductions.values[i];
      }
      if (LibMath.getSafe(productionComponent, playerResourceEntity) < requiredValue) return false;
    }
    return true;
  }

  function checkResourceProductionRequirements(
    IWorld world,
    uint256 playerEntity,
    uint256 entityType
  ) internal view returns (bool) {
    P_ProductionDependenciesComponent productionDependenciesComponent = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    );

    if (!productionDependenciesComponent.has(entityType)) return true;

    ResourceValues memory requiredProductions = productionDependenciesComponent.getValue(entityType);
    ResourceValues memory lastLevelRequiredProductions;

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    for (uint256 i = 0; i < requiredProductions.resources.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredProductions.resources[i], playerEntity);
      if (!productionComponent.has(playerResourceEntity)) return false;
      uint256 requiredValue = requiredProductions.values[i];

      if (LibMath.getSafe(productionComponent, playerResourceEntity) < requiredValue) return false;
    }
    return true;
  }

  function checkCanReduceProduction(
    IWorld world,
    uint256 playerEntity,
    uint256 entityType,
    uint32 level
  ) internal view returns (bool) {
    P_ProductionComponent p_ProductionComponent = P_ProductionComponent(world.getComponent(P_ProductionComponentID));
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));

    uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);

    if (!p_ProductionComponent.has(entityTypeLevelEntity)) return true;

    uint256 entityTypeLasteLevelEntity;

    ResourceValue memory entityLevelProduction = p_ProductionComponent.getValue(entityTypeLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(entityLevelProduction.resource, playerEntity);
    return LibMath.getSafe(productionComponent, playerResourceEntity) >= entityLevelProduction.value;
  }

  function updateRequiredProduction(
    IWorld world,
    uint256 playerEntity,
    uint256 entityType,
    uint32 level,
    bool isApply
  ) internal {
    P_ProductionDependenciesComponent productionDependenciesComponent = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    );
    uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);
    if (!productionDependenciesComponent.has(entityTypeLevelEntity)) return;
    ResourceValues memory requiredProductions = productionDependenciesComponent.getValue(entityTypeLevelEntity);
    ResourceValues memory lastLevelRequiredProductions;
    uint256 entityTypeLasteLevelEntity;
    if (isApply && level > 1) {
      entityTypeLasteLevelEntity = LibEncode.hashKeyEntity(entityType, level - 1);
      lastLevelRequiredProductions = productionDependenciesComponent.getValue(entityTypeLasteLevelEntity);
    }
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    for (uint256 i = 0; i < requiredProductions.resources.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredProductions.resources[i], playerEntity);
      uint32 requiredValue = requiredProductions.values[i];
      if (isApply && level > 1) {
        requiredValue -= lastLevelRequiredProductions.values[i];
      }
      if (requiredValue == 0) continue;

      IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
        entityToAddress(playerEntity),
        requiredProductions.resources[i]
      );

      if (isApply) {
        productionComponent.set(
          playerResourceEntity,
          productionComponent.getValue(playerResourceEntity) - requiredValue
        );
      } else {
        productionComponent.set(
          playerResourceEntity,
          productionComponent.getValue(playerResourceEntity) + requiredValue
        );
      }
    }
  }
}
