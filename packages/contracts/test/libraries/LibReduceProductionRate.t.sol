// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";

import { BuildingType, Level, P_RequiredDependencyData, P_RequiredDependency, ProductionRate, ConsumptionRate, Home } from "codegen/index.sol";

import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";

contract LibReduceProductionRateTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingEntity = "building";
  bytes32 buildingPrototype = "buildingPrototype";
  uint256 level = 2;
  uint256 prevReduction = 5;

  function setUp() public override {
    super.setUp();

    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(uint8(Iron), prevReduction);

    P_RequiredDependency.set(buildingPrototype, level - 1, requiredDependenciesData);
  }

  function testClearDependencyUsage() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    bytes32 asteroidEntity = Home.get(playerEntity);
    ProductionRate.set(asteroidEntity, Iron, originalProduction);
    ConsumptionRate.set(asteroidEntity, Iron, productionReduction);
    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(
      uint8(Iron),
      productionReduction
    );

    P_RequiredDependency.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.clearProductionRateReduction(buildingEntity);

    assertEq(ConsumptionRate.get(asteroidEntity, Iron), 0);
  }

  function testReduceProductionRate() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    bytes32 asteroidEntity = Home.get(playerEntity);
    ProductionRate.set(asteroidEntity, Iron, originalProduction);
    ConsumptionRate.set(asteroidEntity, Iron, prevReduction);
    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(
      uint8(Iron),
      productionReduction
    );

    P_RequiredDependency.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(buildingEntity, level);

    assertEq(ConsumptionRate.get(asteroidEntity, Iron), productionReduction);
  }
}
