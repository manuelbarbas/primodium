// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract DestroySystemTest is PrimodiumTest {
  bytes32 public playerEntity;
  PositionData public position;
  int32[] public blueprint = get2x2Blueprint();

  function setUp() public override {
    super.setUp();

    spawn(alice);
    playerEntity = addressToEntity(alice);
    position = getPosition1(alice);
    vm.startPrank(alice);
  }

  function buildIronMine() private returns (bytes32) {
    removeRequirements(EBuilding.IronMine);
    return world.build(EBuilding.IronMine, position);
  }

  function destroy(bytes32 buildingEntity, PositionData memory _coord) public {
    bytes32[] memory children = Children.get(world, buildingEntity);
    world.destroy(_coord);

    for (uint256 i = 0; i < children.length; i++) {
      assertTrue(OwnedBy.get(world, children[i]) == 0);
      assertTrue(BuildingType.get(world, children[i]) == 0);
    }

    assertTrue(OwnedBy.get(world, buildingEntity) == 0, "has ownedby");
    assertTrue(BuildingType.get(world, buildingEntity) == 0, "has tile");
    assertTrue(Level.get(world, buildingEntity) == 0, "has level");
  }

  function testDestroyWithBuildingOrigin() public {
    bytes32 buildingEntity = buildIronMine();
    destroy(buildingEntity, position);
  }

  function testDestroyWithTile() public {
    bytes32 buildingEntity = buildIronMine();
    bytes32 asteroid = Home.getAsteroid(world, playerEntity);
    position.parent = asteroid;
    destroy(buildingEntity, position);
  }

  function testDestroyWithProductionDependencies() public {
    switchPrank(address(world));
    uint32 originalProduction = 100;
    uint32 productionReduction = 10;
    ProductionRate.set(playerEntity, EResource.Iron, originalProduction);

    P_RequiredDependenciesData memory requiredDependenciesData = P_RequiredDependenciesData(
      new uint8[](1),
      new uint32[](1)
    );
    requiredDependenciesData.resources[0] = uint8(EResource.Iron);
    requiredDependenciesData.amounts[0] = productionReduction;

    P_RequiredDependencies.set(IronMinePrototypeId, 1, requiredDependenciesData);
    switchPrank(alice);

    world.build(EBuilding.IronMine, getIronPosition(alice));
    uint32 productionIncrease = P_Production.get(IronMinePrototypeId, 1).amount;
    assertEq(
      ProductionRate.get(playerEntity, EResource.Iron),
      originalProduction - productionReduction + productionIncrease
    );

    world.destroy(getIronPosition(alice));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), originalProduction);
  }

  function testDestroyWithResourceProductionIncrease() public {
    switchPrank(address(world));

    uint32 increase = 69;
    P_ProductionData memory data = P_ProductionData(EResource.Iron, increase);
    P_Production.set(IronMinePrototypeId, 1, data);
    switchPrank(alice);

    world.build(EBuilding.IronMine, getIronPosition(alice));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), increase);

    world.destroy(getIronPosition(alice));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), 0);
  }

  function testDestroyWithMaxStorageIncrease() public {
    switchPrank(address(world));

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(EResource.Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 1, 50);

    switchPrank(alice);
    world.build(EBuilding.IronMine, getIronPosition(alice));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 50);

    world.destroy(getIronPosition(alice));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 0);
  }
}
