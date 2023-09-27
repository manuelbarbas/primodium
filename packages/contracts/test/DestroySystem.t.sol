// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract DestroySystemTest is PrimodiumTest {
  bytes32 public playerEntity;
  PositionData public position;
  int32[] public blueprint = get2x2Blueprint();

  function setUp() public override {
    super.setUp();

    spawn(creator);
    playerEntity = addressToEntity(creator);
    position = getPosition1(creator);
    vm.startPrank(creator);
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
    switchPrank(address(creator));
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
    switchPrank(creator);

    world.build(EBuilding.IronMine, getIronPosition(creator));
    uint256 productionIncrease = P_Production.get(IronMinePrototypeId, 1).amount;
    assertEq(
      ProductionRate.get(playerEntity, EResource.Iron),
      originalProduction - productionReduction + productionIncrease
    );

    world.destroy(getIronPosition(creator));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), originalProduction);
  }

  function testDestroyWithResourceProductionIncrease() public {
    switchPrank(address(creator));

    uint256 increase = 69;
    P_ProductionData memory data = P_ProductionData(EResource.Iron, increase);
    P_Production.set(IronMinePrototypeId, 1, data);
    switchPrank(creator);

    world.build(EBuilding.IronMine, getIronPosition(creator));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), increase);

    world.destroy(getIronPosition(creator));
    assertEq(ProductionRate.get(playerEntity, EResource.Iron), 0);
  }

  function testDestroyWithMaxStorageIncrease() public {
    switchPrank(creator);

    uint8[] memory data = new uint8[](1);
    data[0] = uint8(EResource.Iron);
    P_ListMaxResourceUpgrades.set(IronMinePrototypeId, 1, data);
    P_ByLevelMaxResourceUpgrades.set(IronMinePrototypeId, EResource.Iron, 1, 50);

    switchPrank(creator);
    world.build(EBuilding.IronMine, getIronPosition(creator));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 50);

    world.destroy(getIronPosition(creator));
    assertEq(MaxResourceCount.get(playerEntity, EResource.Iron), 0);
  }
}
