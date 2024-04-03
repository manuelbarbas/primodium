// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { P_ColonyShipConfig, P_Transportables, Level, IsActive, P_ConsumesResource, ConsumptionRate, P_IsResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_IsUtility, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy, ColonySlots } from "codegen/index.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibColony {
  /**
   * @notice Should this restrict to _player() here? maybe so, and pull it into a normal System
   */
  function increaseColonySlotsCapacity(bytes32 playerEntity) internal returns (uint256 newCapacity) {
    newCapacity = ColonySlots.getCapacity(playerEntity) + 1;
    ColonySlots.setCapacity(playerEntity, newCapacity);
  }

  function getColonySlotsCostMultiplier(bytes32 playerEntity) internal view returns (uint256) {
    uint256 capacity = ColonySlots.getCapacity(playerEntity);
    uint256 multiplier = 4;
    return multiplier * capacity;
  }

  // require(count == 1, "[SpendResources] Colony ships can only be trained one at a time");
  // uint256 cost = P_ColonyShipConfig.getInitialCost() *
  //   LibUnit.getColonyShipCostMultiplier(OwnedBy.get(asteroidEntity));

  // spendResource(asteroidEntity, prototype, P_ColonyShipConfig.getResource(), cost);

  // todo: maybe migrate getColonyShipsPlusAsteroids() here

  // Was initially useful, but redesign may have made it obsolete
  //
  // /**
  // * @notice Should this restrict to _player() here? maybe so, and pull it into a normal System
  // */
  // function occupyColonySlots(bytes32 playerEntity) internal returns (uint256) {
  //     uint256 capacity = ColonySlots.getCapacity(playerEntity);
  //     uint256 occupied = ColonySlots.getOccupied(playerEntity);
  //     require(occupied < capacity, "[LibColony] no more slots available");
  //     ColonySlots.setOccupied(playerEntity, occupied + 1);
  //     return occupied + 1;
  // }

  // /**
  // * @notice don't use _player() here, other players capture to cause a decrease in occupied slots for a different player
  // */
  // function releaseColonySlots(bytes32 playerEntity) internal returns (uint256) {
  //     uint256 occupied = ColonySlots.getOccupied(playerEntity);
  //     require(occupied > 0, "[LibColony] no occupied slots to release");
  //     ColonySlots.setOccupied(playerEntity, occupied - 1);
  //     return occupied - 1;
  // }
}
