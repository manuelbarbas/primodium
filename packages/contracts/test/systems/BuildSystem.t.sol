// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract BuildSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(alice);
    playerEntity = addressToEntity(alice);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testBuildLargeBuilding() public {
    int32[] memory blueprint = get2x2Blueprint();
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = IronMinePrototypeId;

    world.devSetRecord(P_BlueprintTableId, keys, P_Blueprint.encode(blueprint), P_Blueprint.getValueSchema());
    vm.startPrank(alice);
    bytes32 buildingEntity = world.build(EBuilding.IronMine, getIronPosition(alice));

    PositionData memory buildingPosition = Position.get(world, buildingEntity);
    logPosition(buildingPosition);
    bytes32[] memory children = Children.get(world, buildingEntity);
    assertEq(blueprint.length, children.length * 2);

    for (uint256 i = 0; i < children.length; i++) {
      PositionData memory tilePosition = Position.get(children[i]);
      assertEq(
        tilePosition,
        PositionData(
          blueprint[i * 2] + buildingPosition.x,
          blueprint[i * 2 + 1] + buildingPosition.y,
          buildingPosition.parent
        )
      );
      assertEq(buildingEntity, OwnedBy.get(children[i]));
    }
  }

  function testInvalidIndexFail() public {
    vm.startPrank(alice);

    PositionData memory ironPositionData = getNonIronPosition(alice);

    vm.expectRevert(bytes("[BuildSystem] Invalid building type"));
    world.build(EBuilding.LENGTH, ironPositionData);

    vm.stopPrank();
  }

  function testFailIronMineOnNonIron() public {
    vm.startPrank(alice);

    PositionData memory ironPositionData = getNonIronPosition(alice);

    world.build(EBuilding.IronMine, ironPositionData);

    vm.stopPrank();
  }

  function testSameXYCanCollide() public {
    vm.startPrank(alice);
    PositionData memory ironPositionData = getIronPosition(alice);
    world.build(EBuilding.IronMine, ironPositionData);
    vm.stopPrank();
    spawn(bob);
    vm.startPrank(bob);
    ironPositionData = getIronPosition(bob);
    world.build(EBuilding.IronMine, ironPositionData);

    vm.stopPrank();
  }

  function testSameXYZCannotCollideFail() public {
    vm.startPrank(alice);
    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, getPosition1(alice));

    vm.expectRevert(bytes("[BuildSystem] Building already exists"));
    world.build(EBuilding.IronMine, getPosition1(alice));
  }

  function testBuiltOnWrongAsteroid() public {
    vm.startPrank(alice);
    PositionData memory coord = getPosition2(alice);
    coord.parent = bytes32(uint256(69));

    vm.expectRevert(bytes("[BuildSystem] Building must be built on your home asteroid"));
    world.build(EBuilding.IronMine, coord);
  }

  function testBuildTwiceMainBaseFail() public {
    vm.startPrank(alice);

    PositionData memory coord1 = getPosition3(alice);
    vm.expectRevert(bytes("[BuildSystem] Cannot build more than one main base per wallet"));
    world.build(EBuilding.MainBase, coord1);
    vm.stopPrank();
  }

  // function testFailBuildMainBaseLevelNotMet() public {
  //   vm.startPrank(alice);

  //   PositionData memory coord1 = getPosition3(alice);
  //   world.build(DebugSimpleBuildingMainBaseLevelReqID, coord1);
  //   vm.stopPrank();
  // }

  // function testBuildMainBaseLevelMet() public {
  //   vm.startPrank(alice);

    PositionData memory coord1 = getPosition3(alice);

    bytes32[] memory keys = new bytes32[](1);
    keys[0] = addressToEntity(alice);
    world.devSetRecord(
      P_RequiredBaseLevelTableId,
      keys,
      P_RequiredBaseLevel.encode(2),
      P_RequiredBaseLevel.getValueSchema()
    );

    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, coord1);
    vm.stopPrank();
  }

  function testIronMineOnNonIronFail() public {
    vm.startPrank(alice);

    PositionData memory nonIronCoord = getNonIronPosition(alice);

    vm.expectRevert(bytes("[BuildSystem] Cannot build on this tile"));
    world.build(EBuilding.IronMine, nonIronCoord);

    vm.stopPrank();
  }

  function testBuildWithResourceReqs() public {
    vm.startPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    bytes32 ironMinePrototype = P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine));
    assertGe(
      P_RequiredResources.lengthResources(world, ironMinePrototype, 2),
      0,
      "Iron Mine Level 2 should have resource requirements"
    );
  }

  function testBuildWithRequiredResources() public {
    vm.startPrank(address(world));
    ResourceCount.set(playerEntity, EResource.Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);

    switchPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 50);
  }

  function testBuildWithProductionDependencies() public {
    vm.startPrank(address(world));
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(IronMinePrototypeId, 1, requiredDependenciesData);
    switchPrank(alice);

    world.build(EBuilding.IronMine, getIronPosition(alice));
    uint256 productionIncrease = P_Production.get(IronMinePrototypeId, 1).amount;
    assertEq(
      ProductionRate.get(playerEntity, EResource.Iron),
      originalProduction - productionReduction + productionIncrease
    );
  }

  function testBuildWithResourceProductionIncrease() public {
    vm.startPrank(address(world));

    uint256 increase = 69;
    P_ProductionData memory data = P_ProductionData(EResource.Iron, increase);
    P_Production.set(IronMinePrototypeId, 1, data);
    switchPrank(alice);

    world.build(EBuilding.IronMine, getIronPosition(alice));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), increase);
  }

  function testBuildWithMaxStorageIncrease() public {
    vm.startPrank(address(world));

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(EResource.Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 1, 50);

    switchPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 50);
  }
}
