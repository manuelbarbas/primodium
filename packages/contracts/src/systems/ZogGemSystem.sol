// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibStorage, LibResource, LibZogGem } from "codegen/libraries.sol";
import { EResource } from "src/Types.sol";
import { TransferAllowance, Balance } from "codegen/index.sol";
import { IWorld } from "codegen/world/IWorld.sol";

contract ZogGemSystem is PrimodiumSystem {
  modifier onlyCreator() {
    require(_msgSender() == IWorld(_world()).creator(), "[ZogGemSystem] Only creator can call this function");
    _;
  }

  function mint(bytes32 to, uint256 amount) public onlyCreator {
    uint256 balance = Balance.get(to);
    Balance.set(to, balance + amount);
  }

  function burnEntity(bytes32 entity, uint256 amount) public onlyCreator {
    LibZogGem.burn(entity, amount);
  }

  function transfer(bytes32 to, uint256 amount) public {
    LibZogGem.transfer(addressToEntity(_msgSender()), to, amount);
  }

  function burn(uint256 amount) public {
    LibZogGem.burn(addressToEntity(_msgSender()), amount);
  }

  function setTransferAllowance(bytes32 to, uint256 amount) public {
    bytes32 from = addressToEntity(_msgSender());
    require(from != to, "[ResourceSystem] Cannot set transfer allowance to the same entity");
    TransferAllowance.set(from, to, amount);
  }

  function transferFrom(
    bytes32 from,
    bytes32 to,
    uint256 amount
  ) public {
    bytes32 spender = addressToEntity(_msgSender());
    LibZogGem.spendTransferAllowance(from, spender, amount);
    LibZogGem.transfer(from, to, amount);
  }
}
