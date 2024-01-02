// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Delegate, OwnedBy } from "codegen/index.sol";

contract AccessSystem is PrimodiumSystem {
  function grantAccess(address payable delegate) public payable {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 delegateEntity = addressToEntity(delegate);
    require(OwnedBy.get(delegateEntity) == bytes32(0), "Delegate already has an owner");
    OwnedBy.set(delegateEntity, playerEntity);
    Delegate.set(playerEntity, delegateEntity);

    if (msg.value > 0) {
      (bool sent, ) = delegate.call{ value: msg.value }("");
      require(sent, "Failed to send Ether");
    }
  }

  function revokeAccess() public {
    bytes32 player = addressToEntity(_msgSender());
    bytes32 delegate = Delegate.get(player);
    Delegate.deleteRecord(player);
    OwnedBy.deleteRecord(delegate);
  }
}
