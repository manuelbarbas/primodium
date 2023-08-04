// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";
import { OccupiedPassiveResourceComponent, ID as OccupiedPassiveResourceComponentID } from "components/OccupiedPassiveResourceComponent.sol";
import { MaxPassiveComponent, ID as MaxPassiveComponentID } from "components/MaxPassiveComponent.sol";
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
      uint32 requiredAmount = requiredAmounts[i];
      if (buildingLevel > 1)
        requiredAmount -= requiredPassiveComponent
          .getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1))
          .values[i];
      if (getAvailablePassiveCapacity(world, playerEntity, resourceIDs[i]) < requiredAmount) {
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
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceID, playerEntity);
    return
      LibMath.getSafe(MaxPassiveComponent(world.getComponent(MaxPassiveComponentID)), playerResourceEntity) -
      LibMath.getSafe(
        OccupiedPassiveResourceComponent(world.getComponent(OccupiedPassiveResourceComponentID)),
        playerResourceEntity
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
    MaxPassiveComponent maxPassiveComponent = MaxPassiveComponent(world.getComponent(MaxPassiveComponentID));
    uint256 resourceId = passiveProductionComponent.getValue(buildingLevelEntity).resource;
    uint32 capacityIncrease = passiveProductionComponent.getValue(buildingLevelEntity).value;
    if (buildingLevel > 1) {
      capacityIncrease =
        capacityIncrease -
        passiveProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    }
    uint32 newCapacity = LibMath.getSafe(maxPassiveComponent, LibEncode.hashKeyEntity(resourceId, playerEntity)) +
      capacityIncrease;
    maxPassiveComponent.set(LibEncode.hashKeyEntity(resourceId, playerEntity), newCapacity);
  }
}
