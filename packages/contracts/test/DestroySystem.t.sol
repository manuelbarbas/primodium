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

  EBuilding dummyBuilding = EBuilding.IronMine;

  function buildDummy() private returns (bytes32) {
    return world.build(dummyBuilding, position);
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
    bytes32 buildingEntity = buildDummy();
    destroy(buildingEntity, position);
  }

  function testDestroyWithTile() public {
    bytes32 buildingEntity = buildDummy();
    bytes32 asteroid = HomeAsteroid.get(world, playerEntity);
    position.parent = asteroid;
    destroy(buildingEntity, position);
  }
}
