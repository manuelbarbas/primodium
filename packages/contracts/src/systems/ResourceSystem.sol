// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibStorage } from "codegen/libraries.sol";
import { EResource } from "src/Types.sol";
import { TransferAllowance } from "codegen/index.sol";

contract ResourceSystem is PrimodiumSystem {
  function transfer(
    bytes32 to,
    EResource resource,
    uint256 amount
  ) public {
    _transfer(addressToEntity(_msgSender()), to, resource, amount);
  }

  function burn(EResource resource, uint256 amount) public {
    require(amount > 0, "[ResourceSystem] Cannot burn zero");

    LibStorage.decreaseStoredResource(addressToEntity(_msgSender()), uint8(resource), amount);
  }

  function setTransferAllowance(
    bytes32 to,
    EResource resource,
    uint256 amount
  ) public {
    bytes32 from = addressToEntity(_msgSender());
    require(from != to, "[ResourceSystem] Cannot set transfer allowance to the same entity");

    TransferAllowance.set(from, to, uint8(resource), amount);
  }

  function transferFrom(
    bytes32 from,
    bytes32 to,
    EResource resource,
    uint256 amount
  ) public {
    bytes32 spender = addressToEntity(_msgSender());
    _spendTransferAllowance(from, spender, resource, amount);
    _transfer(from, to, resource, amount);
  }

  function _transfer(
    bytes32 from,
    bytes32 to,
    EResource resource,
    uint256 amount
  ) internal {
    require(from != to, "[ResourceSystem] Cannot transfer to the same entity");
    require(amount > 0, "[ResourceSystem] Cannot transfer zero");

    LibStorage.decreaseStoredResource(from, uint8(resource), amount);
    LibStorage.increaseStoredResource(to, uint8(resource), amount);
  }

  function _spendTransferAllowance(
    bytes32 owner,
    bytes32 spender,
    EResource resource,
    uint256 amount
  ) internal {
    uint256 currentAllowance = TransferAllowance.get(owner, spender, uint8(resource));
    if (currentAllowance != type(uint256).max) {
      require(currentAllowance > amount, "[ResourceSystem] Not enough allowance");
    }
    TransferAllowance.set(owner, spender, uint8(resource), currentAllowance - amount);
  }
}
