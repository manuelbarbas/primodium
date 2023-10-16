// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract BuildSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testBuildLargeBuilding() public {
    int32[] memory blueprint = get2x2Blueprint();
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = IronMinePrototypeId;

    P_Blueprint.set(IronMinePrototypeId, blueprint);

    bytes32 buildingEntity = world.build(EBuilding.IronMine, getIronPosition(creator));

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
    PositionData memory ironPositionData = getNonIronPosition(creator);

    vm.expectRevert(bytes("[BuildSystem] Invalid building type"));
    world.build(EBuilding.LENGTH, ironPositionData);
  }

  function testFailIronMineOnNonIron() public {
    PositionData memory ironPositionData = getNonIronPosition(creator);

    world.build(EBuilding.IronMine, ironPositionData);
  }

  function testSameXYCanCollide() public {
    PositionData memory ironPositionData = getIronPosition(creator);
    world.build(EBuilding.IronMine, ironPositionData);
    vm.stopPrank();

    vm.startPrank(bob);
    ironPositionData = getIronPosition(bob);
    world.build(EBuilding.IronMine, ironPositionData);
  }

  function testSameXYZCannotCollideFail() public {
    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, getPosition1(creator));

    vm.expectRevert(bytes("[BuildSystem] Building already exists"));
    world.build(EBuilding.IronMine, getPosition1(creator));
  }

  function testBuiltOnWrongAsteroid() public {
    PositionData memory coord = getIronPosition(bob);
    //coord.parent = addressToEntity(bob);

    vm.expectRevert(bytes("[BuildSystem] Building must be built on your home asteroid"));
    world.build(EBuilding.IronMine, coord);
  }

  function testBuildTwiceMainBaseFail() public {
    PositionData memory coord1 = getPosition3(creator);
    vm.expectRevert(bytes("[BuildSystem] Cannot build more than one main base per wallet"));
    world.build(EBuilding.MainBase, coord1);
  }

  function testBuildMainBaseLevelNotMetFail() public {
    PositionData memory coord1 = getPosition3(creator);
    vm.expectRevert(bytes("[BuildSystem] MainBase level requirement not met"));
    world.build(EBuilding.Hangar, coord1);
  }

  function testBuildMainBaseLevelMet() public {
    PositionData memory coord1 = getPosition3(creator);

    P_RequiredBaseLevel.set(IronMinePrototypeId, 0, 2);
    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, coord1);
  }

  function testIronMineOnNonIronFail() public {
    PositionData memory nonIronCoord = getCopperPosition(creator);

    vm.expectRevert(bytes("[BuildSystem] Cannot build on this tile"));
    world.build(EBuilding.IronMine, nonIronCoord);
  }

  function testBuildWithResourceReqs() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    bytes32 ironMinePrototype = P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine));
    assertGe(
      P_RequiredResources.lengthResources(world, ironMinePrototype, 2),
      0,
      "Iron Mine Level 2 should have resource requirements"
    );
  }

  function testBuildWithRequiredResources() public {
    ResourceCount.set(playerEntity, Iron, 100);
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(IronMinePrototypeId, 1, requiredResourcesData);

    world.build(EBuilding.IronMine, getIronPosition(creator));

    assertEq(ResourceCount.get(playerEntity, Iron), 50);
  }

  function testBuildWithProductionDependencies() public {
    uint256 originalProduction = 100;
    uint256 productionReduction = 10;
    ProductionRate.set(playerEntity, Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint256[](1)
    );
    requiredDependenciesData.resources[0] = uint8(Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(IronMinePrototypeId, 1, requiredDependenciesData);

    world.build(EBuilding.IronMine, getIronPosition(creator));
    uint256 productionIncrease = P_Production.get(IronMinePrototypeId, 1).amount;
    assertEq(ProductionRate.get(playerEntity, Iron), originalProduction - productionReduction + productionIncrease);
  }

  function testBuildWithResourceProductionIncrease() public {
    uint256 increase = 69;
    P_ProductionData memory data = P_ProductionData(uint8(Iron), increase);
    P_Production.set(IronMinePrototypeId, 1, data);

    world.build(EBuilding.IronMine, getIronPosition(creator));
    assertEq(ProductionRate.get(playerEntity, Iron), increase);
  }

  function testBuildWithMaxStorageIncrease() public {
    uint8[] memory data = new uint8[](1);
    data[0] = uint8(Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, Iron, 1, 50);
    MaxResourceCount.set(playerEntity, Iron, 0);
    world.build(EBuilding.IronMine, getIronPosition(creator));
    assertEq(MaxResourceCount.get(playerEntity, Iron), 50);
  }
}
