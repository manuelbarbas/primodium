pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as TrainUnitsSystemID } from "./TrainUnitsSystem.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "./S_UpdateUnclaimedResourcesSystem.sol";

import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnEntityCountSubsystem } from "../interfaces/IOnEntityCountSubsystem.sol";

import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID, ResourceValues } from "../components/P_RequiredResourcesComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "../components/UnitsComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "../components/UnitProductionOwnedByComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID, ResourceValue } from "../components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "../components/UnitProductionQueueIndexComponent.sol";
import { UnitProductionLastQueueIndexComponent, ID as UnitProductionLastQueueIndexComponentID } from "../components/UnitProductionLastQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";

import { LibUnits } from "../libraries/LibUnits.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.S_ClaimUnits"));

contract S_ClaimUnitsSystem is IOnSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    address playerAddress = abi.decode(args, (address));
    require(
      msg.sender == getAddressById(world.systems(), TrainUnitsSystemID) || msg.sender == playerAddress,
      "S_ClaimUnitsSystem: Only TrainUnitsSystem, or the player themself can call this function"
    );

    uint256 playerEntity = addressToEntity(playerAddress);
    uint256[] memory unitProductionBuildingEntities = UnitProductionOwnedByComponent(
      world.getComponent(UnitProductionOwnedByComponentID)
    ).getEntitiesWithValue(playerEntity);

    for (uint32 i = 0; i < unitProductionBuildingEntities.length; i++) {
      claimUnitsFromBuilding(unitProductionBuildingEntities[i], playerEntity);
    }
  }

  function claimUnitsFromBuilding(uint256 unitProductionBuildingEntity, uint256 playerEntity) internal {
    UnitProductionQueueComponent unitProductionQueueComponent = UnitProductionQueueComponent(
      world.getComponent(UnitProductionQueueComponentID)
    );

    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    UnitsComponent unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
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
      uint256 lastClaimedAt = lastClaimedAtComponent.getValue(unitProductionBuildingEntity);
      uint32 trainedUnitsCount = uint32(block.number - lastClaimedAt) / unitTrainingTimeForBuilding;

      uint256 playerUnitTypeEntity = LibEncode.hashKeyEntity(unitProductionQueue.resource, playerEntity);
      if (trainedUnitsCount > 0) {
        if (trainedUnitsCount >= unitProductionQueue.value) {
          trainedUnitsCount = unitProductionQueue.value;
          queueIndex = tryMoveUpQueue(unitProductionBuildingEntity);
          unitProductionQueueComponent.remove(buildingQueueEntity);
          isStillClaiming = queueIndex > 0;
        } else {
          isStillClaiming = false;
          unitProductionQueue.value -= trainedUnitsCount;
          unitProductionQueueComponent.set(buildingQueueEntity, unitProductionQueue);
        }

        lastClaimedAtComponent.set(
          unitProductionBuildingEntity,
          lastClaimedAt + (trainedUnitsCount * unitTrainingTimeForBuilding)
        );
        unitsComponent.set(
          playerUnitTypeEntity,
          LibMath.getSafe(unitsComponent, playerUnitTypeEntity) + trainedUnitsCount
        );
      } else {
        isStillClaiming = false;
      }
    }
  }

  function tryMoveUpQueue(uint256 buildingEntity) internal returns (uint32) {
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

  function executeTyped(address playerAddress) public returns (bytes memory) {
    return execute(abi.encode(playerAddress));
  }
}
