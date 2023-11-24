// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { Level, P_MaxLevel } from "codegen/index.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibEncode, LibBuilding } from "codegen/Libraries.sol";

contract UpgradeRangeSystem is PrimodiumSystem {
  function upgradeRange(bytes32 spaceRockEntity) public {
    bytes32 playerEntity = addressToEntity(msg.sender);

    uint256 targetLevel = Level.get(playerEntity) + 1;
    require(P_MaxLevel.get(ExpansionKey) >= targetLevel, "[UpgradeRangeSystem] Max level reached");
    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, ExpansionKey, targetLevel),
      "[UpgradeRangeSystem] MainBase level requirement not met"
    );

    Level.set(spaceRockEntity, targetLevel);
  }
}
