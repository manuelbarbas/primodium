// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

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
    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(Iron);
    requiredDependenciesData.amounts[0] = prevReduction;

    P_RequiredDependencies.set(buildingPrototype, level - 1, requiredDependenciesData);
  }

  function testClearDependencyUsage() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    ProductionRate.set(spaceRockEntity, Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.clearProductionRateReduction(buildingEntity);

    assertEq(ProductionRate.get(spaceRockEntity, Iron), originalProduction + productionReduction);
  }

  function testReduceProductionRate() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    ProductionRate.set(spaceRockEntity, Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(buildingEntity, level);

    assertEq(ProductionRate.get(spaceRockEntity, Iron), originalProduction - productionReduction + prevReduction);
  }

  function testFailReduceProductionRate() public {
    // Set up mock data with insufficient production rate
    uint256 originalProduction = 5;
    uint256 productionReduction = originalProduction + prevReduction + 1;
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    ProductionRate.set(spaceRockEntity, Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(buildingEntity, level);
  }
}
