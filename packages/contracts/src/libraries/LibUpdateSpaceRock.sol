// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { addressToEntity } from "solecs/utils.sol";

// comps
import { ArrivalComponent, ID as ArrivalComponentID } from "components/ArrivalComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
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
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

// types
import { ESendType, Coord, Arrival, ArrivalUnit, ResourceValue } from "src/types.sol";

library LibUpdateSpaceRock {
  function updateSpaceRock(IWorld world, uint256 playerEntity, uint256 spaceRock) internal {
    bool rockOwnedByPlayer = OwnedByComponent(world.getComponent(OwnedByComponentID)).getValue(spaceRock) ==
      playerEntity;
    uint256 playerSpaceRockEntity = LibEncode.hashKeyEntity(playerEntity, spaceRock);
    uint256 earliestEventBlock = block.number;
    uint256 earliestEventIndex = 0;
    do {
      // max int
      earliestEventIndex = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
      uint256 listSize = ArrivalsList.length(world, playerSpaceRockEntity);
      if (listSize == 0) break;

      // get earliest event
      for (uint256 i = 0; i < listSize; i++) {
        uint256 arrivalBlock = ArrivalsList.getArrivalBlock(world, playerSpaceRockEntity, i);
        if (arrivalBlock < earliestEventBlock) {
          earliestEventBlock = arrivalBlock;
          earliestEventIndex = i;
        }
      }

      if (earliestEventBlock >= block.number) break;
      // claim units
      if (rockOwnedByPlayer) claimUnits(world, playerEntity, earliestEventBlock);
      // apply arrival
      applyArrival(world, ArrivalsList.get(world, playerSpaceRockEntity, earliestEventIndex));
      ArrivalsList.remove(world, playerSpaceRockEntity, earliestEventIndex);
    } while (earliestEventBlock < block.number);
    if (rockOwnedByPlayer) claimUnits(world, playerEntity, block.number);
  }

  function applyArrival(IWorld world, Arrival memory arrival) public {
    UnitsComponent unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
    if (arrival.sendType == ESendType.REINFORCE) {
      for (uint i = 0; i < arrival.units.length; i++) {
        uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(
          uint256(arrival.units[i].unitType),
          arrival.to,
          arrival.destination
        );
        LibMath.add(unitsComponent, unitPlayerSpaceRockEntity, arrival.units[i].count);
      }
    } else {
      revert("LibSend: unimplemented");
    }
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

        uint256 unitPlayerSpaceRockEntity = LibEncode.hashEntities(
          unitProductionQueue.resource,
          playerEntity,
          PositionComponent(world.getComponent(PositionComponentID)).getValue(playerEntity).parent
        );

        LibMath.add(UnitsComponent(world.getComponent(UnitsComponentID)), unitPlayerSpaceRockEntity, trainedUnitsCount);
      } else {
        isStillClaiming = false;
      }
    }
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
