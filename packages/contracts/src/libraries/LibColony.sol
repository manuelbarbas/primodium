// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { ColonySlots } from "codegen/index.sol";

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

  // todo: maybe migrate getColonyShipsPlusAsteroids() here
}
