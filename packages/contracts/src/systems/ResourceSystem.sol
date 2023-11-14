// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibStorage, LibResource } from "codegen/libraries.sol";
import { EResource } from "src/Types.sol";
import { TransferAllowance, ResourceCount } from "codegen/index.sol";

contract ResourceSystem is PrimodiumSystem {
  function transfer(
    bytes32 to,
    EResource resource,
    uint256 amount
  ) public {
    LibResource.transfer(addressToEntity(_msgSender()), to, resource, amount);
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
    LibResource.spendTransferAllowance(from, spender, resource, amount);
    LibResource.transfer(from, to, resource, amount);
  }
}
