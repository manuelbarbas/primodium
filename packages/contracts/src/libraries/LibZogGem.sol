// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Balance, TransferAllowance } from "codegen/index.sol";

library LibZogGem {
  function transfer(
    bytes32 from,
    bytes32 to,
    uint256 amount
  ) internal {
    require(from != to, "[ZogGemSystem] Cannot transfer to the same entity");
    uint256 balance = Balance.get(from);
    require(balance >= amount, "[ZogGemSystem] Not enough balance");
    require(amount > 0, "[ZogGemSystem] Cannot transfer zero");

    Balance.set(from, balance - amount);
    Balance.set(to, Balance.get(to) + amount);
  }

  function spendTransferAllowance(
    bytes32 owner,
    bytes32 spender,
    uint256 amount
  ) internal {
    uint256 currentAllowance = TransferAllowance.get(owner, spender);
    if (currentAllowance != type(uint256).max) {
      require(currentAllowance >= amount, "[ZogGemSystem] Not enough allowance");
    }
    TransferAllowance.set(owner, spender, currentAllowance - amount);
  }

  function burn(bytes32 playerEntity, uint256 amount) internal {
    uint256 balance = Balance.get(playerEntity);
    require(balance >= amount, "[ZogGemSystem] Not enough resources");
    require(amount > 0, "[ZogGemSystem] Cannot burn zero");

    Balance.set(playerEntity, balance - amount);
  }
}
