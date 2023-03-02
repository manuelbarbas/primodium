// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";

// import { MainBaseID, ConveyerID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, ConveyerID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testTerrain() public {
    // TEMP: according to current generation seeds
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -9, y: 6 })), IronID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -3, y: 6 })), IronID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -10, y: 10 })), TungstenID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -13, y: 1 })), AlluviumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -8, y: -6 })), TitaniumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 6, y: 12 })), OsmiumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 23, y: 24 })), BedrockID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 17, y: 2 })), BedrockID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 15, y: 1 })), TungstenID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 16, y: 1 })), UraniniteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 5, y: 25 })), LithiumID);
  }
}
