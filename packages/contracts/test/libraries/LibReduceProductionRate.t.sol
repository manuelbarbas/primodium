// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract LibReduceProductionRateTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingEntity = "building";
  bytes32 buildingPrototype = "buildingPrototype";
  uint256 level = 2;
  uint256 prevReduction = 5;

  function setUp() public override {
    super.setUp();

    vm.startPrank(address(world));
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = prevReduction;

    P_RequiredDependencies.set(buildingPrototype, level - 1, requiredDependenciesData);
  }

  function testClearDependencyUsage() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.clearProductionRateReduction(playerEntity, buildingEntity);

    assertEq(ProductionRate.get(playerEntity, EResource.Iron), originalProduction + productionReduction);
  }

  function testReduceProductionRate() public {
    // Set up mock data
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, level);

    assertEq(
      ProductionRate.get(playerEntity, EResource.Iron),
      originalProduction - productionReduction + prevReduction
    );
  }

  function testFailReduceProductionRate() public {
    // Set up mock data with insufficient production rate
    uint256 originalProduction = 5;
    uint256 productionReduction = originalProduction + prevReduction + 1;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, level);
  }
}
