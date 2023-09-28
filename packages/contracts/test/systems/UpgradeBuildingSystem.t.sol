// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract UpgradeBuildingSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  function testUpgradeMaxedBuildingFail() public {
    PositionData memory coord = getIronPosition(creator);
    bytes32 ironMine = world.build(EBuilding.IronMine, coord);
    uint256 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);

    Level.set(ironMine, ironMineMaxLevel);

    vm.expectRevert(bytes("[UpgradeBuildingSystem] Building has reached max level"));
    world.upgradeBuilding(coord);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    removeRequiredResources(EBuilding.IronMine);
    removeRequiredMainBase(EBuilding.IronMine);
    uint256 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);
    PositionData memory coord = getIronPosition(creator);
    world.build(EBuilding.IronMine, coord);
    for (uint256 i = 1; i < ironMineMaxLevel; i++) {
      assertEq(Level.get(LibEncode.getHash(BuildingKey, coord)), i, "building should be level i");
      world.upgradeBuilding(coord);
    }

    vm.stopPrank();
  }

  function testUpgradeBuildingWithRequiredResources() public {
    uint256 initial = 100;
    uint256 l1 = 50;
    uint256 l2 = 33;
    ResourceCount.set(playerEntity, EResource.Iron, initial);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = l1;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = l2;

    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    switchPrank(creator);
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.upgradeBuilding(getIronPosition(creator));
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), initial - l1 - l2);
  }

  function testUpgradeBuildingWithProductionDependencies() public {
    ResourceCount.set(playerEntity, EResource.Iron, 1000);

    removeRequiredResources(EBuilding.IronMine);

    uint256 originalProduction = 100;
    uint256 l1 = 10;
    uint256 l2 = 12;
    ProductionRate.set(playerEntity, EResource.Copper, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Copper);
    requiredDependenciesData.amounts[0] = l1;
    P_RequiredDependencies.set(IronMinePrototypeId, 1, requiredDependenciesData);

    requiredDependenciesData = P_RequiredDependenciesData(new uint8[](1), new uint256[](1));
    requiredDependenciesData.resources[0] = uint8(EResource.Copper);
    requiredDependenciesData.amounts[0] = l2;
    P_RequiredDependencies.set(IronMinePrototypeId, 2, requiredDependenciesData);

    switchPrank(creator);
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.upgradeBuilding(getIronPosition(creator));

    assertEq(ProductionRate.get(playerEntity, EResource.Copper), originalProduction - l2);
  }

  function testUpgradeBuildingWithResourceProductionIncrease() public {
    removeRequiredResources(EBuilding.IronMine);

    uint256 increase = 69;
    uint256 increase2 = 71;
    P_ProductionData memory data = P_ProductionData(EResource.Iron, increase);
    P_Production.set(IronMinePrototypeId, 1, data);
    data = P_ProductionData(EResource.Iron, increase2);
    P_Production.set(IronMinePrototypeId, 2, data);

    switchPrank(creator);

    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.upgradeBuilding(getIronPosition(creator));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), increase2);
  }

  function testUpgradeBuildingWithMaxStorageIncrease() public {
    removeRequiredResources(EBuilding.IronMine);

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(EResource.Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 2, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 1, 50);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 2, 100);

    switchPrank(creator);
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.upgradeBuilding(getIronPosition(creator));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 100);
  }
}
