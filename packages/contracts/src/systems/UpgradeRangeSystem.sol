// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Level, P_MaxLevel } from "codegen/Tables.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibEncode } from "codegen/Libraries.sol";

contract UpgradeRangeSystem is PrimodiumSystem {
  function upgradeRange() public {
    bytes32 playerEntity = addressToEntity(msg.sender);

    uint32 targetLevel = Level.get(playerEntity) + 1;
    require(P_MaxLevel.get(ExpansionKey) >= targetLevel, "[UpgradeRangeSystem] Max level reached");

    Level.set(playerEntity, targetLevel);
  }
}
