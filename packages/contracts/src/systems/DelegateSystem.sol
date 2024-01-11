// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { UserDelegationControl } from "@latticexyz/world/src/codegen/index.sol";

contract DelegateSystem is PrimodiumSystem {
  function unregisterDelegation(address delegatee) public {
    bytes32 playerEntity = _player();
    UserDelegationControl.deleteRecord({ delegator: _msgSender(), delegatee: delegatee });
  }
}
