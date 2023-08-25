// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { AsteroidTypeComponent, ID as AsteroidTypeComponentID } from "components/AsteroidTypeComponent.sol";
import { P_UnitMiningComponent, ID as P_UnitMiningComponentID } from "components/P_UnitMiningComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { MineableAtComponent, ID as MineableAtComponentID } from "components/MineableAtComponent.sol";
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";
import { MotherlodeResourceComponent, ID as MotherlodeResourceComponentID } from "components/MotherlodeResourceComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "components/UnitProductionOwnedByComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID } from "components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "components/UnitProductionLastQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// libs
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibResource } from "libraries/LibResource.sol";

// types
import { ESendType, Coord, Arrival, ArrivalUnit, ResourceValue, ESpaceRockType, Motherlode } from "src/types.sol";

library LibUpdateSpaceRock {
  function updateSpaceRock(IWorld world, uint256 playerEntity, uint256 spaceRock) internal {
    ESpaceRockType rockType = AsteroidTypeComponent(world.getComponent(AsteroidTypeComponentID)).getValue(spaceRock);
    if (rockType == ESpaceRockType.ASTEROID) claimUnits(world, playerEntity, block.number);
    if (rockType == ESpaceRockType.MOTHERLODE) claimMotherlodeResource(world, playerEntity, spaceRock, block.number);
  }

  function claimUnitsFromBuilding(
    IWorld world,
    uint256 unitProductionBuildingEntity,
    uint256 playerEntity,
    uint256 blockNumber
  ) internal {
    UnitProductionQueueComponent unitProductionQueueComponent = UnitProductionQueueComponent(
      world.getComponent(UnitProductionQueueComponentID)
    );

    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    UnitProductionQueueIndexComponent unitProductionQueueIndexComponent = UnitProductionQueueIndexComponent(
      world.getComponent(UnitProductionQueueIndexComponentID)
    );
    bool isStillClaiming = unitProductionQueueIndexComponent.has(unitProductionBuildingEntity);
    uint32 queueIndex = LibMath.getSafe(unitProductionQueueIndexComponent, unitProductionBuildingEntity);
    uint256 startTime = lastClaimedAtComponent.getValue(unitProductionBuildingEntity);
    while (isStillClaiming) {
      uint256 buildingQueueEntity = LibEncode.hashKeyEntity(unitProductionBuildingEntity, queueIndex);
      ResourceValue memory unitProductionQueue = unitProductionQueueComponent.getValue(buildingQueueEntity);

      uint32 unitTrainingTimeForBuilding = LibUnits.getBuildingBuildTimeForUnit(
        world,
        playerEntity,
        unitProductionBuildingEntity,
        unitProductionQueue.resource
      );
      uint32 trainedUnitsCount = uint32(blockNumber - startTime) / unitTrainingTimeForBuilding;

      if (trainedUnitsCount > 0) {
        if (trainedUnitsCount >= unitProductionQueue.value) {
          trainedUnitsCount = unitProductionQueue.value;
          queueIndex = tryMoveUpQueue(world, unitProductionBuildingEntity);
          unitProductionQueueComponent.remove(buildingQueueEntity);
          isStillClaiming = queueIndex > 0;
        } else {
          isStillClaiming = false;
          unitProductionQueue.value -= trainedUnitsCount;
          unitProductionQueueComponent.set(buildingQueueEntity, unitProductionQueue);
        }

        startTime += trainedUnitsCount * unitTrainingTimeForBuilding;
        addPlayerUnitsToAsteroid(world, playerEntity, unitProductionQueue.resource, trainedUnitsCount);
      } else {
        isStillClaiming = false;
      }
    }
    lastClaimedAtComponent.set(unitProductionBuildingEntity, blockNumber);
  }

  function addPlayerUnitsToAsteroid(IWorld world, uint256 playerEntity, uint256 unitType, uint32 unitCount) internal {
    uint256 asteroid = PositionComponent(world.getComponent(PositionComponentID)).getValue(playerEntity).parent;
    uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(unitType, playerEntity, asteroid);

    LibMath.add(UnitsComponent(world.getComponent(UnitsComponentID)), unitPlayerSpaceRockEntity, unitCount);
  }

  function claimUnits(IWorld world, uint256 playerEntity, uint256 blockNumber) internal {
    uint256[] memory unitProductionBuildingEntities = UnitProductionOwnedByComponent(
      world.getComponent(UnitProductionOwnedByComponentID)
    ).getEntitiesWithValue(playerEntity);

    for (uint32 i = 0; i < unitProductionBuildingEntities.length; i++) {
      claimUnitsFromBuilding(world, unitProductionBuildingEntities[i], playerEntity, blockNumber);
    }
  }

  function tryMoveUpQueue(IWorld world, uint256 buildingEntity) internal returns (uint32) {
    UnitProductionQueueIndexComponent unitProductionQueueIndexComponent = UnitProductionQueueIndexComponent(
      world.getComponent(UnitProductionQueueIndexComponentID)
    );
    UnitProductionLastQueueIndexComponent unitProductionLastQueueIndexComponent = UnitProductionLastQueueIndexComponent(
      world.getComponent(UnitProductionLastQueueIndexComponentID)
    );
    uint32 queueIndex = LibMath.getSafe(unitProductionQueueIndexComponent, buildingEntity);
    uint32 lastQueueIndex = LibMath.getSafe(unitProductionLastQueueIndexComponent, buildingEntity);

    if (queueIndex < lastQueueIndex) {
      unitProductionQueueIndexComponent.set(buildingEntity, queueIndex + 1);
      return queueIndex + 1;
    } else {
      unitProductionQueueIndexComponent.remove(buildingEntity);
      return 0;
    }
  }

  function claimMotherlodeResource(
    IWorld world,
    uint256 playerEntity,
    uint256 motherlodeEntity,
    uint256 blockNumber
  ) internal {
    MineableAtComponent mineableAtComponent = MineableAtComponent(world.getComponent(MineableAtComponentID));
    // cannot claim during cooldown

    if (blockNumber < mineableAtComponent.getValue(motherlodeEntity)) return;

    uint32 blocksSinceLastClaim = uint32(
      blockNumber - LastClaimedAtComponent(world.getComponent(LastClaimedAtComponentID)).getValue(motherlodeEntity)
    );

    // cannot claim if no mining power
    uint32 miningPower = getMiningPower(world, playerEntity, motherlodeEntity);
    if (miningPower == 0) return;

    MotherlodeResourceComponent motherlodeResourceComponent = MotherlodeResourceComponent(
      world.getComponent(MotherlodeResourceComponentID)
    );
    Motherlode memory motherlode = MotherlodeComponent(world.getComponent(MotherlodeComponentID)).getValue(
      motherlodeEntity
    );
    ResourceValue memory resource = P_MotherlodeResourceComponent(world.getComponent(P_MotherlodeResourceComponentID))
      .getValue(LibEncode.hashKeyEntity(uint256(motherlode.motherlodeType), uint256(motherlode.size)));

    uint32 prevMotherlodeResources = LibMath.getSafe(motherlodeResourceComponent, motherlodeEntity);

    // cannot claim if resources are maxed out
    if (resource.value == prevMotherlodeResources) return;

    // get the amount of resources that have been mined
    uint32 rawIncrease = miningPower * blocksSinceLastClaim;
    if (rawIncrease + prevMotherlodeResources > resource.value) {
      rawIncrease = resource.value - prevMotherlodeResources;
    }
    motherlodeResourceComponent.set(motherlodeEntity, rawIncrease + prevMotherlodeResources);
    uint32 currAmount = LibMath.getSafe(
      ItemComponent(world.getComponent(ItemComponentID)),
      LibEncode.hashKeyEntity(resource.resource, playerEntity)
    );
    LibResource.updateResourceAmount(world, playerEntity, resource.resource, currAmount + rawIncrease);

    LastClaimedAtComponent(world.getComponent(LastClaimedAtComponentID)).set(motherlodeEntity, blockNumber);
  }

  function getMiningPower(IWorld world, uint256 playerEntity, uint256 motherlodeEntity) internal view returns (uint32) {
    P_UnitMiningComponent miningComponent = P_UnitMiningComponent(world.getComponent(P_UnitMiningComponentID));
    uint256[] memory minerPrototypes = miningComponent.getEntities();
    uint32 totalPower = 0;
    for (uint256 i = 0; i < minerPrototypes.length; i++) {
      uint256 minerPrototype = minerPrototypes[i];
      uint256 minerEntity = LibEncode.hashEntities(minerPrototype, playerEntity, motherlodeEntity);
      uint32 units = LibMath.getSafe(UnitsComponent(world.getComponent(UnitsComponentID)), minerEntity);
      if (units > 0) {
        uint32 miningPower = miningComponent.getValue(minerPrototype);
        totalPower += miningPower * units;
      }
    }
    return totalPower;
  }
}
