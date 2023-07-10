// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "std-contracts/test/MudTest.t.sol";
import { Deploy } from "./Deploy.sol";
import { Coord } from "../types.sol";

contract PrimodiumTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  Coord public coord = Coord(0, 0);
  Coord public coord1 = Coord(0, 1);
  Coord public coord2 = Coord(0, 2);

  uint256 public dummyBuilding = uint256(bytes32("dummy"));

  function setUp() public virtual override {
    super.setUp();
  }

  modifier prank(address prankster) {
    vm.startPrank(prankster);
    _;
    vm.stopPrank();
  }

  function assertCoordEq(Coord memory coordA, Coord memory coordB) internal {
    assertEq(coordA.x, coordB.x, "[assertCoordEq]: x doesn't match");
    assertEq(coordA.y, coordB.y, "[assertCoordEq]: y doesn't match");
  }

  function assertFalse(bool input) internal {
    assertTrue(!input);
  }

  function makeBlueprint() internal view returns (Coord[] memory blueprint) {
    blueprint = new Coord[](3);

    blueprint[0] = coord;
    blueprint[1] = coord1;
    blueprint[2] = coord2;
  }
}
