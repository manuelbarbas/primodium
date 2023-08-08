// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

contract PerlinTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuild() public {
    vm.startPrank(alice);

    // 0.5 * 2**64
    Coord memory coord = getOrigin(alice);
    assertEq(LibTerrain.getTerrainDepth(coord), 9223372036854775808);

    // 0.23141101002693176 * 2**64
    Coord memory coord2 = Coord({ x: -3, y: -2, parent: 0 });
    int128 coord2Depth = LibTerrain.getTerrainDepth(coord2);
    int256 coord2Mul = Math.muli(coord2Depth, 100);
    assertEq(coord2Mul, 23);

    // 0.39083947986364365 * 10000
    Coord memory coord3 = getIronCoord(alice);
    int128 coord3Depth = LibTerrain.getTerrainDepth(coord3);
    int256 coord3Mul = LibTerrain.mulDepthBy10000(coord3Depth);
    assertEq(coord3Mul, 3908);

    // 0.35673321038484573 * 10000
    Coord memory coord4 = Coord({ x: -9, y: -6, parent: 0 });
    int128 coord4Depth = LibTerrain.getTerrainDepth(coord4);
    int256 coord4Mul = LibTerrain.mulDepthBy10000(coord4Depth);
    assertEq(coord4Mul, 3567);

    // 0.4929771423339844 * 10000
    // does not round! so it's 4929 instead of 4930
    Coord memory coord5 = Coord({ x: 8, y: 1, parent: 0 });
    int128 coord5Depth = LibTerrain.getTerrainDepth(coord5);
    int256 coord5Mul = LibTerrain.mulDepthBy10000(coord5Depth);
    assertEq(coord5Mul, 4929);

    vm.stopPrank();
  }
}
