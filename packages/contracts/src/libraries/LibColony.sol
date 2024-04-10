// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { ColonyShipPrototypeId } from "codegen/Prototypes.sol";

import { MaxColonySlots, P_ColonySlotsMultiplier } from "codegen/index.sol";

library LibColony {
  function increaseMaxColonySlots(bytes32 playerEntity) internal returns (uint256 newMaxColonySlots) {
    newMaxColonySlots = MaxColonySlots.get(playerEntity) + 1;
    MaxColonySlots.set(playerEntity, newMaxColonySlots);
  }

  function getColonySlotsCostMultiplier(bytes32 playerEntity) internal view returns (uint256) {
    uint256 maxColonySlots = MaxColonySlots.get(playerEntity);
    uint256 multiplier = P_ColonySlotsMultiplier.get();
    return multiplier * maxColonySlots;
  }

  // todo: maybe migrate getColonyShipsPlusAsteroids() here
}
