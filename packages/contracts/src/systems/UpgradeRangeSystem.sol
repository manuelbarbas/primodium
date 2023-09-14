// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Level, P_MaxLevel } from "codegen/Tables.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibEncode, LibBuilding } from "codegen/Libraries.sol";

contract UpgradeRangeSystem is PrimodiumSystem {
  function upgradeRange() public {
    bytes32 playerEntity = addressToEntity(msg.sender);

    uint32 targetLevel = Level.get(playerEntity) + 1;
    require(P_MaxLevel.get(ExpansionKey) >= targetLevel, "[UpgradeRangeSystem] Max level reached");
    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, ExpansionKey, targetLevel),
      "[UpgradeRangeSystem] MainBase level requirement not met"
    );

    Level.set(playerEntity, targetLevel);
  }
}
