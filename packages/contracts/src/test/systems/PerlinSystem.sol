// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibPerlin } from "../../libraries/LibPerlin.sol";
import { Coord, VoxelCoord } from "../../types.sol";

import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

contract PerlinTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testBuild() public {
    vm.startPrank(alice);

    // 0.5 * 2**64
    Coord memory coord = Coord({ x: 0, y: 0 });
    assertEq(LibPerlin.getTerrainDepth(coord), 9223372036854775808);

    // 0.23141101002693176 * 2**64
    Coord memory coord2 = Coord({ x: -3, y: -2 });
    int128 coord2Depth = LibPerlin.getTerrainDepth(coord2);
    int256 coord2Mul = Math.muli(coord2Depth, 100);
    assertEq(coord2Mul, 23);

    // 0.39083947986364365 * 10000
    Coord memory coord3 = Coord({ x: -5, y: 2 });
    int128 coord3Depth = LibPerlin.getTerrainDepth(coord3);
    int256 coord3Mul = LibPerlin.mulDepthBy10000(coord3Depth);
    assertEq(coord3Mul, 3908);

    // 0.35673321038484573 * 10000
    Coord memory coord4 = Coord({ x: -9, y: -6 });
    int128 coord4Depth = LibPerlin.getTerrainDepth(coord4);
    int256 coord4Mul = LibPerlin.mulDepthBy10000(coord4Depth);
    assertEq(coord4Mul, 3567);

    // 0.4929771423339844 * 10000
    // does not round! so it's 4929 instead of 4930
    Coord memory coord5 = Coord({ x: 8, y: 1 });
    int128 coord5Depth = LibPerlin.getTerrainDepth(coord5);
    int256 coord5Mul = LibPerlin.mulDepthBy10000(coord5Depth);
    assertEq(coord5Mul, 4929);

    vm.stopPrank();
  }
}
