pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as ResearchSystemID } from "./ResearchSystem.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "./S_UpdateUnclaimedResourcesSystem.sol";

import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnEntityCountSubsystem } from "../interfaces/IOnEntityCountSubsystem.sol";

import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID, ResourceValues } from "../components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "../components/UnitProductionOwnedByComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID, ResourceValue } from "../components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "../components/UnitProductionQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";

import { LibUnits } from "../libraries/LibUnits.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.S_ClaimUnits"));

contract S_ClaimUnitsSystem is IOnSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), ResearchSystemID),
      "S_SpendRequiredResourcesSystem: Only BuildSystem, UpgradeSystem, ResearchSystem can call this function"
    );

    address playerAddress = abi.decode(args, (address));
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256[] memory unitProductionBuildingEntities = UnitProductionOwnedByComponent(
      world.getComponent(UnitProductionOwnedByComponentID)
    ).getEntitiesWithValue(playerEntity);

    UnitProductionQueueComponent unitProductionQueueComponent = UnitProductionQueueComponent(
      world.getComponent(UnitProductionQueueComponentID)
    );
    UnitProductionQueueIndexComponent unitProductionQueueIndexComponent = UnitProductionQueueIndexComponent(
      world.getComponent(UnitProductionQueueIndexComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    for (uint32 i = 0; i < unitProductionBuildingEntities.length; i++) {
      uint256 unitProductionBuildingEntity = unitProductionBuildingEntities[i];

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
          if (trainedUnitsCount > unitProductionQueue.value) {
            trainedUnitsCount = unitProductionQueue.value;
            if (queueIndex > 0) unitProductionQueueIndexComponent.set(unitProductionBuildingEntity, queueIndex - 1);
            else {
              unitProductionQueueIndexComponent.remove(unitProductionBuildingEntity);
              isStillClaiming = false;
            }
          } else {
            isStillClaiming = false;
            if (unitProductionQueue.value > trainedUnitsCount) {
              unitProductionQueue.value -= trainedUnitsCount;
              unitProductionQueueComponent.set(buildingQueueEntity, unitProductionQueue);
            } else {
              unitProductionQueueComponent.remove(buildingQueueEntity);
              if (queueIndex > 0) unitProductionQueueIndexComponent.set(unitProductionBuildingEntity, queueIndex - 1);
              else unitProductionQueueIndexComponent.remove(unitProductionBuildingEntity);
            }
          }
          lastClaimedAtComponent.set(
            unitProductionBuildingEntity,
            lastClaimedAt + (trainedUnitsCount * unitTrainingTimeForBuilding)
          );
          itemComponent.set(
            playerUnitTypeEntity,
            LibMath.getSafe(itemComponent, playerUnitTypeEntity) + trainedUnitsCount
          );
        } else {
          isStillClaiming = false;
        }
      }
    }
  }

  function executeTyped(address playerAddress) public returns (bytes memory) {
    return execute(abi.encode(playerAddress));
  }
}
