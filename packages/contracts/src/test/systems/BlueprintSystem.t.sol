// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { addressToEntity } from "solecs/utils.sol";

// systems
import { BlueprintSystem, ID as BlueprintSystemID } from "../../systems/BlueprintSystem.sol";

// components
import { BlueprintComponent, ID as BlueprintComponentID } from "../../components/BlueprintComponent.sol";

//buildings
import "../../prototypes/Tiles.sol";

contract BlueprintSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  BlueprintSystem public blueprintSystem;
  BlueprintComponent public blueprintComponent;

  function setUp() public override {
    super.setUp();
    // setup systems
    blueprintSystem = BlueprintSystem(system(BlueprintSystemID));

    // setup components
    blueprintComponent = BlueprintComponent(component(BlueprintComponentID));

    // setup other
  }

  function testBlueprint() public prank(alice) {
    Coord[] memory blueprint = makeBlueprint();
    blueprintSystem.executeTyped(DummyBuilding, blueprint);

    int32[] memory coords = blueprintComponent.getValue(DummyBuilding);

    for (uint i = 0; i < blueprint.length; i++) {
      Coord memory testCoord = Coord(coords[i * 2], coords[i * 2 + 1]);
      assertCoordEq(blueprint[i], testCoord);
    }
  }

  function testRevertAlreadyMade() public {
    testBlueprint();

    vm.expectRevert("[BlueprintSystem]: building already has a blueprint");
    blueprintSystem.executeTyped(DummyBuilding, new Coord[](0));
  }

  function testRawIntArray() public prank(alice) {
    Coord[] memory blueprint = makeBlueprint();
    int32[] memory blueprintInt = coordArrayToIntArray(blueprint);

    blueprintSystem.executeTyped(DummyBuilding, blueprintInt);

    int32[] memory coords = blueprintComponent.getValue(DummyBuilding);

    for (uint i = 0; i < blueprint.length; i++) {
      Coord memory testCoord = Coord(coords[i * 2], coords[i * 2 + 1]);
      assertCoordEq(blueprint[i], testCoord);
    }
  }

  function testRevertOddArrayLength() public prank(alice) {
    int32[] memory blueprintInt = new int32[](1);
    blueprintInt[0] = 69;
    vm.expectRevert("[BlueprintSystem]: odd array length");
    blueprintSystem.executeTyped(DummyBuilding, blueprintInt);
  }

  function coordArrayToIntArray(Coord[] memory coords) private pure returns (int32[] memory ints) {
    ints = new int32[](coords.length * 2);
    for (uint256 i = 0; i < coords.length; i++) {
      ints[i * 2] = coords[i].x;
      ints[i * 2 + 1] = coords[i].y;
    }
  }

  function makeBlueprint() private view returns (Coord[] memory blueprint) {
    blueprint = new Coord[](3);

    blueprint[0] = coord;
    blueprint[1] = coord1;
    blueprint[2] = coord2;
  }
}
