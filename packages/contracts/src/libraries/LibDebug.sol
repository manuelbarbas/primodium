// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { SingletonID } from "solecs/SingletonID.sol";
import { IWorld } from "solecs/System.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";

library LibDebug {
  function isDebug(IWorld world) internal view returns (bool) {
    return IsDebugComponent(getAddressById(world.components(), IsDebugComponentID)).has(SingletonID);
  }
}
