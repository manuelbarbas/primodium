// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Test when playerEntity and unit are valid and upgradeUnit is successful.
Test when playerEntity is valid but doesn't meet MainBase level requirement.
Test when unit has reached Max level.
Test with invalid unit.
Test when currentLevel is 0.
Edge Cases
Test when playerEntity is an empty bytes32.
Test maximum allowed P_MaxLevel.get(unitPrototype).
*/

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

import { P_RequiredBaseLevel, P_EnumToPrototype, Home, OwnedBy, P_EnumToPrototype, ResourceCount, P_MaxLevel, P_RequiredUpgradeResources, MaxResourceCount, UnitLevel } from "codegen/index.sol";

contract UpgradeUnitSystemTest is PrimodiumTest {
  bytes32 unitPrototype = "unit";
  EUnit unit = EUnit(1);
  bytes32 playerEntity;
  bytes32 homeAsteroid = "homeAsteroid";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    Home.set(playerEntity, homeAsteroid);
    OwnedBy.set(homeAsteroid, playerEntity);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);
    P_MaxLevel.set(unitPrototype, 2);
  }

  function testUpgradeUnit1() public {
    world.Pri_11__upgradeUnit(homeAsteroid, unit);
    assertEq(UnitLevel.get(homeAsteroid, unitPrototype), 1);
  }

  function testUpgradeUnitMainBaseLevelRequirementNotMet() public {
    P_RequiredBaseLevel.set(unitPrototype, 1, 3);
    vm.expectRevert(bytes("[UpgradeUnitSystem] MainBase level requirement not met"));
    world.Pri_11__upgradeUnit(homeAsteroid, unit);
  }

  function testUpgradeUnitMaxLevelReached() public {
    P_MaxLevel.set(unitPrototype, 0);
    vm.expectRevert(bytes("[UpgradeUnitSystem] Max level reached"));
    world.Pri_11__upgradeUnit(homeAsteroid, unit);
  }

  function testUpgradeUnitHasRequiredResources() public {
    uint8[] memory requiredResources = new uint8[](1);
    requiredResources[0] = uint8(Iron);
    uint256[] memory requiredAmounts = new uint256[](1);
    requiredAmounts[0] = 100;
    P_RequiredUpgradeResources.set(unitPrototype, 1, requiredResources, requiredAmounts);
    MaxResourceCount.set(homeAsteroid, Iron, 100);
    ResourceCount.set(homeAsteroid, Iron, 100);
    UnitLevel.set(playerEntity, unitPrototype, 0);
    world.Pri_11__upgradeUnit(homeAsteroid, unit);
    assertEq(ResourceCount.get(homeAsteroid, Iron), 0);
  }

  function testUpgradeUnitWithoutRequiredResources() public {
    uint8[] memory requiredResources = new uint8[](1);
    requiredResources[0] = uint8(Iron);
    uint256[] memory requiredAmounts = new uint256[](1);
    requiredAmounts[0] = 100;
    P_RequiredUpgradeResources.set(unitPrototype, 1, requiredResources, requiredAmounts);

    vm.expectRevert(bytes("[SpendResources] Not enough resources to spend"));
    world.Pri_11__upgradeUnit(homeAsteroid, unit);
  }

  function invalidUnit() public {
    vm.expectRevert();
    world.Pri_11__upgradeUnit(homeAsteroid, EUnit(uint8(100)));
  }
}
