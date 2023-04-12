// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibBuild {
  // build a miner with 100 iron
  function buildBasicMiner(Uint256Component ironResourceComponent, uint256 entity) internal {
    uint256 IRON_REQUIRED = 100;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
    }
  }
}
