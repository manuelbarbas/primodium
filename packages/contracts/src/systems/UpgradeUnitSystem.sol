// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy, P_EnumToPrototype, P_MaxLevel, UnitLevel } from "codegen/index.sol";
import { LibBuilding, LibResource, LibProduction } from "codegen/Libraries.sol";
import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

contract UpgradeUnitSystem is PrimodiumSystem {
  /// @notice Upgrades the specified unit for the sender
  /// @param unit The type of unit to upgrade
  function upgradeUnit(bytes32 spaceRockEntity, EUnit unit) public claimResources(spaceRockEntity) {
    bytes32 playerEntity = _player();
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(unit));
    uint256 currentLevel = UnitLevel.get(playerEntity, unitPrototype);
    uint256 targetLevel = currentLevel + 1;
    require(OwnedBy.get(spaceRockEntity) == playerEntity, "[UpgradeUnitSystem] space rock not owned by player");
    require(unit != EUnit.NULL && unit != EUnit.LENGTH, "[UpgradeUnitSystem] Invalid unit");

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, unitPrototype, targetLevel),
      "[UpgradeUnitSystem] MainBase level requirement not met"
    );

    require(targetLevel <= P_MaxLevel.get(unitPrototype), "[UpgradeUnitSystem] Max level reached");

    UnitLevel.set(playerEntity, unitPrototype, targetLevel);

    //TODO: this is a HotFix for upgrading mining vessels it works as the only unit which mines resources is the mining vessel
    // should be replaced by generalized logic
    //upgrade for unit is universal and not specific to space rock
    LibProduction.upgradeUnitResourceProduction(playerEntity, unitPrototype, targetLevel);
  }
}
