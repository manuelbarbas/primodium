// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EBuilding, EResource } from "src/Types.sol";
import { MainBasePrototypeId, IronMinePrototypeId } from "codegen/Prototypes.sol";

import { P_ListMaxResourceUpgrades, MaxResourceCount, P_ByLevelMaxResourceUpgrades, P_RequiredResourcesData, P_RequiredResources, ResourceCount, ProductionRate, P_RequiredDependency, P_RequiredDependencyData, Level, ConsumptionRate, P_Production, P_ProductionData, PositionData, Home, P_MaxLevel, P_RequiredBaseLevel, BuildingType } from "codegen/index.sol";

contract UpgradeBuildingSystemTest is PrimodiumTest {
  bytes32 playerEntity;
  bytes32 asteroidEntity;

  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
    asteroidEntity = Home.get(playerEntity);
    vm.startPrank(creator);
  }

  function testUpgradeMaxedBuildingFail() public {
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    uint256 ironMineMaxLevel = P_MaxLevel.get(IronMinePrototypeId);

    Level.set(ironMine, ironMineMaxLevel);

    vm.expectRevert(bytes("[UpgradeBuildingSystem] Building has reached max level"));
    world.Pri_11__upgradeBuilding(ironMine);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    removeRequiredResources(EBuilding.IronMine);
    removeRequiredMainBase(EBuilding.IronMine);
    uint256 ironMineMaxLevel = P_MaxLevel.get(IronMinePrototypeId);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    for (uint256 i = 1; i < ironMineMaxLevel; i++) {
      assertEq(Level.get(ironMine), i, "building should be level i");
      world.Pri_11__upgradeBuilding(ironMine);
    }

    vm.stopPrank();
  }

  function testUpgradeBuildingFailRequiredMainBase() public {
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 building = world.Pri_11__build(EBuilding.IronMine, coord);
    upgradeBuilding(creator, building);

    P_RequiredResourcesData memory requiredResources = getUpgradeCost(building);
    provideResources(asteroidEntity, requiredResources);

    vm.startPrank(creator);
    uint256 currentMainBaseLevel = Level.get(Home.get(asteroidEntity));
    P_RequiredBaseLevel.set(BuildingType.get(building), Level.get(building) + 1, currentMainBaseLevel + 1);

    vm.expectRevert("[UpgradeBuildingSystem] MainBase level requirement not met");
    world.Pri_11__upgradeBuilding(building);
    vm.stopPrank();
  }

  function testUpgradeBuildingWithRequiredResources() public {
    uint256 initial = 100;
    uint256 l1 = 50;
    uint256 l2 = 33;
    ResourceCount.set(asteroidEntity, Iron, initial);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = l1;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = l2;

    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__upgradeBuilding(ironMine);
    assertEq(ResourceCount.get(asteroidEntity, Iron), initial - l1 - l2);
  }

  function testUpgradeInactiveBuildingWithRequiredResources() public {
    uint256 initial = 100;
    uint256 l1 = 50;
    uint256 l2 = 33;
    ResourceCount.set(asteroidEntity, Iron, initial);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = l1;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = l2;

    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__toggleBuilding(ironMine);
    world.Pri_11__upgradeBuilding(ironMine);
    assertEq(ResourceCount.get(asteroidEntity, Iron), initial - l1 - l2);
  }

  function testUpgradeBuildingWithProductionDependencies() public {
    ResourceCount.set(asteroidEntity, Iron, 1000);

    removeRequiredResources(EBuilding.IronMine);

    uint256 originalProduction = 100;
    uint256 l1 = 10;
    uint256 l2 = 12;
    ProductionRate.set(asteroidEntity, Copper, originalProduction);

    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(uint8(Copper), l1);
    P_RequiredDependency.set(IronMinePrototypeId, 1, requiredDependenciesData);

    requiredDependenciesData = P_RequiredDependencyData(uint8(Copper), l2);
    P_RequiredDependency.set(IronMinePrototypeId, 2, requiredDependenciesData);

    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__upgradeBuilding(ironMine);

    assertEq(ProductionRate.get(asteroidEntity, Copper), originalProduction);
    assertEq(ConsumptionRate.get(asteroidEntity, Copper), l2);
  }

  function testUpgradeInactiveBuildingWithProductionDependencies() public {
    ResourceCount.set(asteroidEntity, Iron, 1000);

    removeRequiredResources(EBuilding.IronMine);

    uint256 originalProduction = 100;
    uint256 l1 = 10;
    uint256 l2 = 12;
    ProductionRate.set(asteroidEntity, Copper, originalProduction);

    P_RequiredDependencyData memory requiredDependenciesData = P_RequiredDependencyData(uint8(Copper), l1);
    P_RequiredDependency.set(IronMinePrototypeId, 1, requiredDependenciesData);

    requiredDependenciesData = P_RequiredDependencyData(uint8(Copper), l2);
    P_RequiredDependency.set(IronMinePrototypeId, 2, requiredDependenciesData);

    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__toggleBuilding(ironMine);

    world.Pri_11__upgradeBuilding(ironMine);

    assertEq(ProductionRate.get(asteroidEntity, Copper), originalProduction);
    assertEq(ConsumptionRate.get(asteroidEntity, Copper), 0);
  }

  function testUpgradeBuildingWithResourceProductionIncrease() public {
    removeRequiredResources(EBuilding.IronMine);
    uint256 increase = 69;
    uint256 increase2 = 71;
    P_ProductionData memory data1 = P_ProductionData(new uint8[](1), new uint256[](1));
    data1.resources[0] = uint8(EResource.Iron);
    data1.amounts[0] = increase;
    P_Production.set(IronMinePrototypeId, 1, data1);

    data1 = P_ProductionData(new uint8[](1), new uint256[](1));
    data1.resources[0] = uint8(EResource.Iron);
    data1.amounts[0] = increase2;
    P_Production.set(IronMinePrototypeId, 2, data1);

    switchPrank(creator);

    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__upgradeBuilding(ironMine);
    assertEq(ProductionRate.get(asteroidEntity, Iron), increase2);
  }

  function testUpgradeInActiveBuildingWithResourceProductionIncrease() public {
    removeRequiredResources(EBuilding.IronMine);
    uint256 increase = 69;
    uint256 increase2 = 71;
    P_ProductionData memory data1 = P_ProductionData(new uint8[](1), new uint256[](1));
    data1.resources[0] = uint8(EResource.Iron);
    data1.amounts[0] = increase;
    P_Production.set(IronMinePrototypeId, 1, data1);

    data1 = P_ProductionData(new uint8[](1), new uint256[](1));
    data1.resources[0] = uint8(EResource.Iron);
    data1.amounts[0] = increase2;
    P_Production.set(IronMinePrototypeId, 2, data1);

    switchPrank(creator);

    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__toggleBuilding(ironMine);

    uint256 gas = gasleft();
    world.Pri_11__upgradeBuilding(ironMine);
    console.log("used ", gas - gasleft());
    assertEq(ProductionRate.get(asteroidEntity, Iron), 0);
  }

  function testUpgradeMainBase() public {
    bytes32 mainBase = Home.get(asteroidEntity);

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(MainBasePrototypeId, 2);
    provideResources(asteroidEntity, requiredResources);

    vm.startPrank(creator);
    uint256 gas = gasleft();
    world.Pri_11__upgradeBuilding(mainBase);
    console.log("after", gas - gasleft());
  }

  function testUpgradeBuildingWithMaxStorageIncrease() public {
    removeRequiredResources(EBuilding.IronMine);
    uint8[] memory data = new uint8[](1);
    data[0] = uint8(Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 2, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 1, 50);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 2, 100);
    MaxResourceCount.set(asteroidEntity, Iron, 0);
    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    uint256 gas = gasleft();
    world.Pri_11__upgradeBuilding(ironMine);
    console.log("after", gas - gasleft());

    assertEq(MaxResourceCount.get(asteroidEntity, Iron), 100);
  }

  function testUpgradeInActiveBuildingWithMaxStorageIncrease() public {
    removeRequiredResources(EBuilding.IronMine);
    uint8[] memory data = new uint8[](1);
    data[0] = uint8(Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 2, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 1, 50);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 2, 100);
    MaxResourceCount.set(asteroidEntity, Iron, 0);
    switchPrank(creator);
    PositionData memory coord = getTilePosition(asteroidEntity, EBuilding.IronMine);
    bytes32 ironMine = world.Pri_11__build(EBuilding.IronMine, coord);
    world.Pri_11__toggleBuilding(ironMine);

    world.Pri_11__upgradeBuilding(ironMine);
    assertEq(MaxResourceCount.get(asteroidEntity, Iron), 0);
  }
}
