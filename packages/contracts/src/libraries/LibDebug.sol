// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";
import { IsDebugComponent, ID as IsDebugComponentID } from "components/IsDebugComponent.sol";

library LibDebug {
  function isDebug() internal pure returns (bool) {
    // return true;
    return false;
  }
}
