// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract UpgradeBuildingSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    spawn(alice);
    playerEntity = addressToEntity(alice);
  }

  function testUpgradeMaxedBuildingFail() public {
    vm.startPrank(alice);
    PositionData memory coord = getIronPosition(alice);
    bytes32 ironMine = world.build(EBuilding.IronMine, coord);
    uint32 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = ironMine;

    world.devSetRecord(LevelTableId, keys, Level.encode(ironMineMaxLevel), Level.getValueSchema());

    vm.expectRevert(bytes("[UpgradeBuildingSystem] Building has reached max level"));
    world.upgradeBuilding(coord);
    vm.stopPrank();
  }

  function testUpgradeToMaxLevel() public {
    removeRequiredResources(EBuilding.IronMine);
    removeRequiredMainBase(EBuilding.IronMine);
    uint32 ironMineMaxLevel = P_MaxLevel.get(world, IronMinePrototypeId);
    vm.startPrank(alice);
    PositionData memory coord = getIronPosition(alice);
    bytes32 ironMine = world.build(EBuilding.IronMine, coord);
    for (uint256 i = 1; i < ironMineMaxLevel; i++) {
      assertEq(Level.get(LibEncode.getHash(BuildingKey, coord)), i, "building should be level i");
      world.upgradeBuilding(coord);
    }

    vm.stopPrank();
  }

  function testUpgradeBuildingWithRequiredResources() public {
    uint32 initial = 100;
    uint32 l1 = 50;
    uint32 l2 = 33;
    vm.startPrank(address(world));
    ResourceCount.set(playerEntity, EResource.Iron, initial);
    uint32 playerResourceCount = ResourceCount.get(playerEntity, EResource.Iron);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint32[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = l1;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint32[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = l2;

    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    switchPrank(alice);
    console.log("alice:", alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    world.upgradeBuilding(getIronPosition(alice));
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), initial - l1 - l2);
  }

  function testUpgradeBuildingWithProductionDependencies() public {
    vm.startPrank(address(world));
    ResourceCount.set(playerEntity, EResource.Iron, 1000);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](0), new uint32[](0));
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    uint32 originalProduction = 100;
    uint32 l1 = 10;
    uint32 l2 = 12;
    ProductionRate.set(playerEntity, EResource.Copper, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Copper);
    requiredDependenciesData.amounts[0] = l1;
    P_RequiredDependencies.set(IronMinePrototypeId, 1, requiredDependenciesData);

    requiredDependenciesData = P_RequiredDependenciesData(new uint8[](1), new uint32[](1));
    requiredDependenciesData.resources[0] = uint8(EResource.Copper);
    requiredDependenciesData.amounts[0] = l2;
    P_RequiredDependencies.set(IronMinePrototypeId, 2, requiredDependenciesData);

    switchPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    world.upgradeBuilding(getIronPosition(alice));

    assertEq(ProductionRate.get(playerEntity, EResource.Copper), originalProduction - l2);
  }

  function testUpgradeBuildingWithResourceProductionIncrease() public {
    vm.startPrank(address(world));

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](0), new uint32[](0));
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    uint32 increase = 69;
    uint32 increase2 = 71;
    P_ProductionData memory data = P_ProductionData(EResource.Iron, increase);
    P_Production.set(IronMinePrototypeId, 1, data);
    data = P_ProductionData(EResource.Iron, increase2);
    P_Production.set(IronMinePrototypeId, 2, data);

    switchPrank(alice);

    world.build(EBuilding.IronMine, getIronPosition(alice));
    world.upgradeBuilding(getIronPosition(alice));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), increase2);
  }

  function testUpgradeBuildingWithMaxStorageIncrease() public {
    vm.startPrank(address(world));

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](0), new uint32[](0));
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);
    P_RequiredResources.set(IronMinePrototypeId, 2, requiredResourcesData);

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(EResource.Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 2, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 1, 50);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 2, 100);

    switchPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    world.upgradeBuilding(getIronPosition(alice));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 100);
  }
}
