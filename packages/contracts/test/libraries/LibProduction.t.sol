// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibProductionTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingEntity = "buildingEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  uint256 level = 1;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
  }

  function testUpgradeResourceProductionNonUtility() public {
    uint256 amount1 = 20;
    uint256 amount2 = 40;
    uint256 amount3 = 57;

    P_ProductionData memory data1 = P_ProductionData(uint8(EResource.Iron), amount1);
    P_ProductionData memory data2 = P_ProductionData(uint8(EResource.Iron), amount2);
    P_ProductionData memory data3 = P_ProductionData(uint8(EResource.Iron), amount3);

    P_Production.set(buildingPrototype, 1, data1);
    P_Production.set(buildingPrototype, 2, data2);
    P_Production.set(buildingPrototype, 3, data3);

    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 1);
    assertEq(ProductionRate.get(playerEntity, uint8(EResource.Iron)), amount1);
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 2);
    assertEq(ProductionRate.get(playerEntity, uint8(EResource.Iron)), amount2);
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 3);
    assertEq(ProductionRate.get(playerEntity, uint8(EResource.Iron)), amount3);
  }

  function testUpgradeResourceProductionUtility() public {
    P_IsUtility.set(uint8(EResource.Iron), true);

    uint256 amount1 = 20;
    uint256 amount2 = 40;
    uint256 amount3 = 57;
    P_ProductionData memory data1 = P_ProductionData(uint8(EResource.Iron), amount1);
    P_ProductionData memory data2 = P_ProductionData(uint8(EResource.Iron), amount2);
    P_ProductionData memory data3 = P_ProductionData(uint8(EResource.Iron), amount3);

    P_Production.set(buildingPrototype, 1, data1);
    P_Production.set(buildingPrototype, 2, data2);
    P_Production.set(buildingPrototype, 3, data3);

    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 1);
    assertEq(MaxResourceCount.get(playerEntity, uint8(EResource.Iron)), amount1);
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 2);
    assertEq(MaxResourceCount.get(playerEntity, uint8(EResource.Iron)), amount2);
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 3);
    assertEq(MaxResourceCount.get(playerEntity, uint8(EResource.Iron)), amount3);

    assertEq(ProductionRate.get(buildingEntity, uint8(EResource.Iron)), 0);
  }

  function testClearResourceProductionUtility() public {
    P_IsUtility.set(uint8(EResource.Iron), true);
    LibProduction.clearResourceProduction(playerEntity, buildingEntity);
    uint256 startingAmount = 50;
    uint256 amountCleared = 20;
    MaxResourceCount.set(playerEntity, uint8(EResource.Iron), startingAmount);
    ResourceCount.set(playerEntity, uint8(EResource.Iron), startingAmount);
    P_ProductionData memory data1 = P_ProductionData(uint8(EResource.Iron), amountCleared);
    P_Production.set(buildingPrototype, level, data1);

    LibProduction.clearResourceProduction(playerEntity, buildingEntity);
    assertEq(
      MaxResourceCount.get(playerEntity, uint8(EResource.Iron)),
      startingAmount - amountCleared,
      "max resource count not as expected"
    );
    assertEq(
      ResourceCount.get(playerEntity, uint8(EResource.Iron)),
      startingAmount - amountCleared,
      "resource count not as expected"
    );
  }

  function testClearResourceProductionNonUtility() public {
    uint256 startingAmount = 50;
    uint256 amountCleared = 20;
    ProductionRate.set(playerEntity, uint8(EResource.Iron), 50);

    P_ProductionData memory data1 = P_ProductionData(uint8(EResource.Iron), amountCleared);
    P_Production.set(buildingPrototype, level, data1);

    LibProduction.clearResourceProduction(playerEntity, buildingEntity);
    assertEq(ProductionRate.get(playerEntity, uint8(EResource.Iron)), startingAmount - amountCleared);
  }
}
