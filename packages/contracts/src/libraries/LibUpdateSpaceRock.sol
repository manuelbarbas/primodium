// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "components/UnitProductionOwnedByComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID } from "components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "components/UnitProductionLastQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";

// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibUnits } from "libraries/LibUnits.sol";

// types
import { ESendType, Coord, Arrival, ArrivalUnit, ResourceValue } from "src/types.sol";

library LibUpdateSpaceRock {
  function updateSpaceRock(IWorld world, uint256 playerEntity, uint256 spaceRock) internal {
    claimUnits(world, playerEntity, block.number);
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
    while (isStillClaiming) {
      uint256 buildingQueueEntity = LibEncode.hashKeyEntity(unitProductionBuildingEntity, queueIndex);
      ResourceValue memory unitProductionQueue = unitProductionQueueComponent.getValue(buildingQueueEntity);

      uint32 unitTrainingTimeForBuilding = LibUnits.getBuildingBuildTimeForUnit(
        world,
        playerEntity,
        unitProductionBuildingEntity,
        unitProductionQueue.resource
      );
      uint32 trainedUnitsCount = uint32(blockNumber - lastClaimedAtComponent.getValue(unitProductionBuildingEntity)) /
        unitTrainingTimeForBuilding;

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

        LibMath.add(
          lastClaimedAtComponent,
          unitProductionBuildingEntity,
          trainedUnitsCount * unitTrainingTimeForBuilding
        );
        addPlayerUnitsToAsteroid(world, playerEntity, unitProductionQueue.resource, trainedUnitsCount);
      } else {
        isStillClaiming = false;
      }
    }
    lastClaimedAtComponent.set(unitProductionBuildingEntity, blockNumber);
  }

  function addPlayerUnitsToAsteroid(IWorld world, uint256 playerEntity, uint256 unitType, uint32 unitCount) internal {
    uint256 asteroid = PositionComponent(world.getComponent(PositionComponentID)).getValue(playerEntity).parent;
    addUnitsToAsteroid(world, playerEntity, asteroid, unitType, unitCount);
  }

  function addUnitsToAsteroid(
    IWorld world,
    uint256 playerEntity,
    uint256 asteroidEntity,
    uint256 unitType,
    uint32 unitCount
  ) internal {
    uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(unitType, playerEntity, asteroidEntity);
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
}
