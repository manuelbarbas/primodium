// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";
import { P_RequiredDependencies, P_RequiredDependenciesData, P_Production, P_ProductionData, ProductionRate, Level, BuildingType } from "codegen/Tables.sol";
import { LibReduceProductionRate } from "codegen/Libraries.sol";
import { EResource } from "src/Types.sol";

contract LibReduceProductionRateTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingEntity = "building";
  bytes32 buildingPrototype = "buildingPrototype";
  uint32 level = 2;
  uint32 prevReduction = 5;

  function setUp() public override {
    super.setUp();

    vm.startPrank(address(world));
    BuildingType.set(buildingEntity, buildingPrototype);
    Level.set(buildingEntity, level);
    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = prevReduction;

    P_RequiredDependencies.set(buildingPrototype, level - 1, requiredDependenciesData);
  }

  function testClearDependencyUsage() public {
    // Set up mock data
    uint32 originalProduction = 100;
    uint32 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.clearProductionRateReduction(playerEntity, buildingEntity);

    assertEq(ProductionRate.get(playerEntity, EResource.Iron), originalProduction + productionReduction);
  }

  function testReduceProductionRate() public {
    // Set up mock data
    uint32 originalProduction = 100;
    uint32 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
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
    uint32 originalProduction = 5;
    uint32 productionReduction = originalProduction + prevReduction + 1;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(buildingPrototype, level, requiredDependenciesData);

    LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, level);
  }
}
