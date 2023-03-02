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
    assertEq(LibTerrain.getTopLayerKey(Coord({ x:-102, y: -34 })), TitaniumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -127, y: -51 })), KimberliteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -145, y: -35 })), IridiumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -95, y: 48 })), BolutiteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -280, y: 64 })), BolutiteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -94, y: 48 })), SandstoneID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -280, y: 64 })), BolutiteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -44, y: -1 })), RegolithID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -61, y: -24 })), LithiumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -60, y: -25 })), CopperID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -8, y: -6 })), TitaniumID);
    //prev 1 error here tungsten -> regolith (was my error)
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -23, y: -12 })), RegolithID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 32, y: -35 })), OsmiumID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 796, y: -740 })), BedrockID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 816, y: -725 })), KimberliteID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 797, y: -711 })), CopperID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: 921, y: -742 })), TungstenID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 957, y: -744 })), KimberliteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 956, y: -743 })), KimberliteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 977, y: -747 })), AlluviumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1022, y: -765 })), BedrockID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1021, y: -791 })), UraniniteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1022, y: -791 })), TungstenID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1057, y: -791 })), LithiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1110, y: -806 })), LithiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1163, y: -806 })), BiofilmID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1189, y: -757 })), WaterID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1129, y: -730 })), IronID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1166, y: -707 })), OsmiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1105, y: -686 })), BolutiteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1106, y: -543 })), IridiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1070, y: -576 })), UraniniteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1083, y: -456 })), CopperID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1096, y: -452 })), SandstoneID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1043, y: -430 })), KimberliteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 1037, y: -351 })), CopperID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 876, y: -352 })), TungstenID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 820, y: -305 })), BiofilmID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 784, y: -279 })), BiofilmID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 783, y: -279 })), LithiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 794, y: -256 })), CopperID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 770, y: -303 })), BedrockID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: 769, y: -289 })), TungstenID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -31, y: -5 })), AlluviumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -38, y: 0 })), RegolithID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -38, y: -1 })), TitaniumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -70, y: 39 })), RegolithID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -65, y: 42 })), BiofilmID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -87, y: 42 })), WaterID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -95, y: 36 })), BedrockID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -102, y: 30 })), WaterID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -107, y: 28 })), IridiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -139, y: 41 })), BedrockID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -161, y: 42 })), TungstenID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -173, y: 33 })), SandstoneID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -173, y: 52 })), LithiumID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -224, y: 57 })), KimberliteID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -230, y: 53 })), RegolithID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -232, y: 53 })), BedrockID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -280, y: 59 })), IronID);
    // assertEq(LibTerrain.getTopLayerKey(Coord({ x: -276, y: 55 })), UraniniteID);
   
   console.log("WATER:");
console.log(WaterID);
   console.log("REGOLITH:");
    console.log(RegolithID);
       console.log("SANDSTONE:");
    console.log(SandstoneID);
           console.log("ALLUVIUM:");
    console.log(AlluviumID);
           console.log("LITHIUM MINER:");
    console.log(LithiumMinerID);
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
