// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Delegate, OwnedBy } from "codegen/index.sol";

/// @title Access System Contract
/// @notice Manages granting and revoking access to delegates within the Primodium system.
/// @dev Inherits from PrimodiumSystem for core functionalities.
contract AccessSystem is PrimodiumSystem {
  /// @notice Grants access to a delegate and optionally sends Ether to them.
  /// @dev Sets the delegate's owner and updates the Delegate mapping.
  /// @param delegate The address of the delegate to grant access to.
  function grantAccess(address payable delegate) public payable {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 delegateEntity = addressToEntity(delegate);
    require(!Spawned.get(delegateEntity) && OwnedBy.get(delegateEntity) == bytes32(0), "Delegate already has an owner");

    OwnedBy.set(delegateEntity, playerEntity);
    Delegate.set(playerEntity, delegateEntity);

    if (msg.value > 0) {
      (bool sent, ) = delegate.call{ value: msg.value }("");
      require(sent, "Failed to send Ether");
    }
  }

  /// @notice Revokes access for the owner, removing their delegate.
  /// @dev Deletes records from Delegate and OwnedBy mappings for the owner.
  function revokeAccessOwner() public {
    bytes32 player = addressToEntity(_msgSender());
    bytes32 delegate = Delegate.get(player);
    Delegate.deleteRecord(player);
    OwnedBy.deleteRecord(delegate);
  }

  /// @notice Revokes access for the delegate, removing their link to the owner.
  /// @dev Deletes records from Delegate and OwnedBy mappings for the delegate.
  function revokeAccessDelegate() public {
    bytes32 delegate = addressToEntity(_msgSender());
    bytes32 player = OwnedBy.get(player);
    Delegate.deleteRecord(player);
    OwnedBy.deleteRecord(delegate);
  }
}
