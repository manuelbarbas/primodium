// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";
import { OccupiedPassiveResourceComponent, ID as OccupiedPassiveResourceComponentID } from "components/OccupiedPassiveResourceComponent.sol";
import { PassiveResourceCapacityComponent, ID as PassiveResourceCapacityComponentID } from "components/PassiveResourceCapacityComponent.sol";
// libraries

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";

library LibPassiveResource {
  function checkPassiveResourceReqs(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal view returns (bool) {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!requiredPassiveComponent.has(buildingLevelEntity)) return true;

    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      if (getAvailablePassiveCapacity(world, playerEntity, resourceIDs[i]) < requiredAmounts[i]) {
        return false;
      }
    }
    return true;
  }

  function updatePassiveResources(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      world.getComponent(RequiredPassiveComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!requiredPassiveComponent.has(buildingLevelEntity)) return;
    OccupiedPassiveResourceComponent occupiedPassiveResourceComponent = OccupiedPassiveResourceComponent(
      world.getComponent(OccupiedPassiveResourceComponentID)
    );
    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLevelEntity).values;

    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
      occupiedPassiveResourceComponent.set(
        playerResourceEntity,
        LibMath.getSafe(occupiedPassiveResourceComponent, playerResourceEntity) + requiredAmounts[i]
      );
    }
  }

  function getAvailablePassiveCapacity(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceID
  ) internal view returns (uint32) {
    return
      LibMath.getSafe(
        PassiveResourceCapacityComponent(world.getComponent(PassiveResourceCapacityComponentID)),
        LibEncode.hashKeyEntity(resourceID, playerEntity)
      ) -
      LibMath.getSafe(
        OccupiedPassiveResourceComponent(world.getComponent(OccupiedPassiveResourceComponentID)),
        LibEncode.hashKeyEntity(resourceID, playerEntity)
      );
  }

  function updatePassiveProduction(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal {
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(world.components(), PassiveProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!passiveProductionComponent.has(buildingLevelEntity)) return;
    PassiveResourceCapacityComponent passiveResourceCapacityComponent = PassiveResourceCapacityComponent(
      world.getComponent(PassiveResourceCapacityComponentID)
    );
    uint256 resourceId = passiveProductionComponent.getValue(buildingLevelEntity).resource;
    uint32 capacityIncrease = passiveProductionComponent.getValue(buildingLevelEntity).value;
    if (buildingLevel > 1) {
      capacityIncrease =
        capacityIncrease -
        passiveProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    }
    uint32 newCapacity = LibMath.getSafe(
      passiveResourceCapacityComponent,
      LibEncode.hashKeyEntity(resourceId, playerEntity)
    ) + capacityIncrease;
    passiveResourceCapacityComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), newCapacity);
  }
}
