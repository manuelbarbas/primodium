// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import "../PrimodiumTest.t.sol";

import { MainBaseID, WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

contract BuildSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testTerrain() public {
    // TEMP: according to current generation seeds
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -9, y: 6, parent: 0 })), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -3, y: 6, parent: 0 })), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -10, y: 10, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -13, y: 1, parent: 0 })), AlluviumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -8, y: -6, parent: 0 })), TitaniumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 6, y: 12, parent: 0 })), OsmiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 23, y: 24, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 17, y: 2, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 15, y: 1, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 16, y: 1, parent: 0 })), UraniniteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 5, y: 25, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -102, y: -34, parent: 0 })), TitaniumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -127, y: -51, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -145, y: -35, parent: 0 })), IridiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -95, y: 48, parent: 0 })), BolutiteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -280, y: 64, parent: 0 })), BolutiteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -94, y: 48, parent: 0 })), SandstoneID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -280, y: 64, parent: 0 })), BolutiteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -44, y: -1, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -61, y: -24, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -60, y: -25, parent: 0 })), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -8, y: -6, parent: 0 })), TitaniumID);
    //prev 1 error here tungsten -> regolith (was my error)
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -23, y: -12, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 32, y: -35, parent: 0 })), OsmiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 796, y: -740, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 816, y: -725, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 797, y: -711, parent: 0 })), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 921, y: -742, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 957, y: -744, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 956, y: -743, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 977, y: -747, parent: 0 })), AlluviumID);
    // one fail
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1022, y: -765, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1021, y: -791, parent: 0 })), UraniniteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1022, y: -791, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1057, y: -791, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1110, y: -806, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1163, y: -806, parent: 0 })), BiofilmID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1189, y: -757, parent: 0 })), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1129, y: -730, parent: 0 })), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1166, y: -707, parent: 0 })), OsmiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1105, y: -686, parent: 0 })), BolutiteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1106, y: -543, parent: 0 })), IridiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1070, y: -576, parent: 0 })), UraniniteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1083, y: -456, parent: 0 })), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1096, y: -452, parent: 0 })), SandstoneID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1043, y: -430, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 1037, y: -351, parent: 0 })), CopperID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 876, y: -352, parent: 0 })), TungstenID);
    // one fail
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 820, y: -305, parent: 0 })), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 784, y: -279, parent: 0 })), BiofilmID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 783, y: -279, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 794, y: -256, parent: 0 })), CopperID);
    // one fail
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 770, y: -303, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: 769, y: -289, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -31, y: -5, parent: 0 })), AlluviumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -38, y: 0, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -38, y: -1, parent: 0 })), TitaniumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -70, y: 39, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -65, y: 42, parent: 0 })), BiofilmID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -87, y: 42, parent: 0 })), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -95, y: 36, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -102, y: 30, parent: 0 })), WaterID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -107, y: 28, parent: 0 })), IridiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -139, y: 41, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -161, y: 42, parent: 0 })), TungstenID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -173, y: 33, parent: 0 })), SandstoneID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -173, y: 52, parent: 0 })), LithiumID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -224, y: 57, parent: 0 })), KimberliteID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -230, y: 53, parent: 0 })), RegolithID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -232, y: 53, parent: 0 })), BedrockID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -280, y: 59, parent: 0 })), IronID);
    assertEq(LibTerrain.getResourceByCoord(world, Coord({ x: -276, y: 55, parent: 0 })), UraniniteID);

    console.log("WATER:");
    console.log(WaterID);
    console.log("REGOLITH:");
    console.log(RegolithID);
    console.log("SANDSTONE:");
    console.log(SandstoneID);
    console.log("ALLUVIUM:");
    console.log(AlluviumID);
    console.log("BIOFILM:");
    console.log(BiofilmID);
    console.log("BEDROCK:");
    console.log(BedrockID);
    console.log("AIR:");
    console.log(AirID);
    console.log("COPPER:");
    console.log(CopperID);
    console.log("LITHIUM:");
    console.log(LithiumID);
    console.log("IRON:");
    console.log(IronID);
    console.log("TITANIUM:");
    console.log(TitaniumID);
    console.log("IRIDIUM:");
    console.log(IridiumID);
    console.log("OSMIUM:");
    console.log(OsmiumID);
    console.log("TUNGSTEN:");
    console.log(TungstenID);
    console.log("KIMBERLITE:");
    console.log(KimberliteID);
    console.log("URANINITE:");
    console.log(UraniniteID);
    console.log("BOLUTITE:");
    console.log(BolutiteID);
  }
}
