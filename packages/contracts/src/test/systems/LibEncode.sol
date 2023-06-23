// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";

import { addressToEntity, entityToAddress } from "solecs/utils.sol";
import { Coord } from "std-contracts/components/CoordComponent.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibEncodeTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testCoordEncoding() public {
    uint256 coordEntity = LibEncode.encodeCoordEntity(Coord({x: 1, y: 2}), "test");
    Coord memory decoded = LibEncode.decodeCoordEntity(coordEntity);
    assertEq(1, decoded.x);
    assertEq(2, decoded.y);
  }

  function testFuzzCoordEncoding(int32 x, int32 y) public {
    Coord memory coord = Coord(x, y);
    uint256 coordEntity = LibEncode.encodeCoordEntity(coord, "building");
    Coord memory decoded = LibEncode.decodeCoordEntity(coordEntity);
    assertEq(coord.x, decoded.x);
    assertEq(coord.y, decoded.y);
  }

  // function testUint160Mask() public {
  //   uint256 rawAddr = 0xfcc5ba1a98fc477b8948a04d08c6f4a76181fe75021370ab5e6abd22b1792a2a;
  //   address addr = 0x08c6F4A76181fe75021370ab5e6abd22b1792a2a;

  //   assertEq(entityToAddress(rawAddr), addr);
  // }

  // function testHashLithiumAnomaly() public {
  //   // control key, equivalent to CopperID
  //   uint256 copperKey = 0x9182d0838cda5b8b8d04b7fdb048ae0d49c90dd4f4ef46ab0958cf6328dfb2ca;
  //   assertEq(copperKey, CopperID, "copper key is correct");

  //   // key is equivalent to LithiumID
  //   uint256 key = 0x17025afdea42119548a0a5f9ec0cdbdcb19e7a9f4b475913071021a3cdbb5bfd;
  //   assertEq(key, LithiumID, "lithium key is correct");

  //   address addr = 0x08c6F4A76181fe75021370ab5e6abd22b1792a2a;
  //   uint256 browserResult = 0xeca34f2b0223a68bf924ac6039230f608d3402b84363c664fc8e2dadbef21f9e;

  //   assertEq(LibEncode.hashFromAddress(key, addr), browserResult);
  // }
}
