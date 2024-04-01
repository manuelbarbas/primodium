// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { P_ColonyShipConfig, P_Transportables, Level, IsActive, P_ConsumesResource, ConsumptionRate, P_IsResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_IsUtility, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy, ColonyShipSlots } from "codegen/index.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibColony {
  /**
   * @notice Should this restrict to _player() here? maybe so, and pull it into a normal System
   */
  function increaseColonyShipSlotCapacity(bytes32 playerEntity) internal returns (uint256 newCapacity) {
    newCapacity = ColonyShipSlots.getCapacity(playerEntity) + 1;
    ColonyShipSlots.setCapacity(playerEntity, newCapacity);
  }

  // Was initially useful, but redesign may have made it obsolete
  //
  // /**
  // * @notice Should this restrict to _player() here? maybe so, and pull it into a normal System
  // */
  // function occupyColonyShipSlot(bytes32 playerEntity) internal returns (uint256) {
  //     uint256 capacity = ColonyShipSlots.getCapacity(playerEntity);
  //     uint256 occupied = ColonyShipSlots.getOccupied(playerEntity);
  //     require(occupied < capacity, "[LibColony] no more slots available");
  //     ColonyShipSlots.setOccupied(playerEntity, occupied + 1);
  //     return occupied + 1;
  // }

  // /**
  // * @notice don't use _player() here, other players capture to cause a decrease in occupied slots for a different player
  // */
  // function releaseColonyShipSlot(bytes32 playerEntity) internal returns (uint256) {
  //     uint256 occupied = ColonyShipSlots.getOccupied(playerEntity);
  //     require(occupied > 0, "[LibColony] no occupied slots to release");
  //     ColonyShipSlots.setOccupied(playerEntity, occupied - 1);
  //     return occupied - 1;
  // }
}
