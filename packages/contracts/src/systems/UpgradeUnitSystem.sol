// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { P_EnumToPrototype, P_MaxLevel, UnitLevel } from "codegen/Tables.sol";
import { LibBuilding, LibResource } from "codegen/Libraries.sol";
import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

contract UpgradeUnitSystem is PrimodiumSystem {
  function upgradeUnit(EUnit unit) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    uint256 currentLevel = UnitLevel.get(playerEntity, unitPrototype);
    uint256 targetLevel = currentLevel == 0 ? 2 : currentLevel + 1;

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, unitPrototype, targetLevel),
      "[UpgradeUnitSystem] MainBase level requirement not met"
    );

    require(targetLevel < P_MaxLevel.get(unitPrototype), "[UpgradeUnitSystem] Max level reached");

    UnitLevel.set(playerEntity, unitPrototype, targetLevel);

    LibResource.spendUpgradeResources(playerEntity, unitPrototype, targetLevel);
  }
}
