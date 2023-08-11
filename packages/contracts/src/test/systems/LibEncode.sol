// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { Coord } from "../../types.sol";
import { addressToEntity, entityToAddress } from "solecs/utils.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes.sol";

import { TitaniumResourceItemID } from "../../prototypes.sol";
import { IronMineID } from "../../prototypes.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibEncodeTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testHash32vs256() public {
    uint256 entityId = 2345676543;
    uint32 small = 32;
    uint256 big = 32;
    assertEq(LibEncode.hashKeyEntity(small, entityId), LibEncode.hashKeyEntity(big, entityId));
  }

  function testHashKeyEntity() public {
    bytes32 clientTestOne = bytes32(LibEncode.hashKeyEntity(0, 0));
    bytes32 clientTestTwo = bytes32(LibEncode.hashKeyEntity(90, 2));
    bytes32 clientTestThree = bytes32(LibEncode.hashKeyEntity(10, 100));
    bytes32 clientTestFour = bytes32(LibEncode.hashKeyEntity(12345, 678910));
    bytes32 clientTestFive = bytes32(LibEncode.hashKeyEntity(25262728, 30313233));

    assertEq(clientTestOne, 0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5);
    assertEq(clientTestTwo, 0x045e11159efe5db0ada3cb8d2e196919e1d0ef71b9b06d0d60609840a64719a3);
    assertEq(clientTestThree, 0x6b17b8cb5e84a99ff8477b1ce6041bf12d9716e79d07056760acebbb8354fbd1);
    assertEq(clientTestFour, 0x0c5c051a91a8ab2d13ce6a81f1030321cbaa0af9e7d9b7f67acbfeb12def84d3);
    assertEq(clientTestFive, 0xf7eea64553e727e221059874c9505c46a9e9ec09f44b6527830b639b77cb4ddd);
  }

  struct CoordOutput {
    Coord coord;
    string key;
    uint256 output;
  }

  function getCoordOutputs() internal pure returns (CoordOutput[] memory coordOutputs) {
    coordOutputs = new CoordOutput[](5);
    coordOutputs[0] = CoordOutput(
      Coord(0, 0, 0),
      "building",
      19828691625151199819925894263310015295956025344535852370549237859831322790673
    );
    coordOutputs[1] = CoordOutput(
      Coord(1, 5, 123),
      "building",
      109148753008226741991702484166202944633515591219524242558445782281528478512641
    );
    coordOutputs[2] = CoordOutput(
      Coord(-1, 10, 0),
      "building",
      103533954559848020612050344332934577129382484874517710751975151449750747241804
    );
    coordOutputs[3] = CoordOutput(
      Coord(123458, -22324234, 0),
      "building",
      111518471964263571474455470130025425666986359214977074161153522376787685319637
    );
    coordOutputs[4] = CoordOutput(
      Coord(-929331, -723932, 0),
      "building",
      32215382666935507160146267019595249092158368377584145094984290894592005171865
    );
  }

  //todo: delete this
  function testPrintHashKeyEntityItems() public view {
    console.log(LibEncode.hashKeyCoord("building", Coord(0, 0, 0)));
    console.log(LibEncode.hashKeyCoord("building", Coord(1, 5, 123)));
    console.log(LibEncode.hashKeyCoord("building", Coord(-1, 10, 0)));
    console.log(LibEncode.hashKeyCoord("building", Coord(123458, -22324234, 0)));
    console.log(LibEncode.hashKeyCoord("building", Coord(-929331, -723932, 0)));
  }

  function testHashKeyCoord() public {
    CoordOutput[] memory coordOutputs = getCoordOutputs();
    for (uint256 i = 0; i < coordOutputs.length; i++) {
      CoordOutput memory coordOutput = coordOutputs[i];
      assertEq(LibEncode.hashKeyCoord(coordOutput.key, coordOutput.coord), coordOutput.output);
    }
  }

  function testFuzzCoordEncoding(int32 x, int32 y) public {
    Coord memory coord = Coord(x, y, 0);
    uint256 coordEntity = LibEncode.encodeCoord(coord);
    Coord memory decoded = LibEncode.decodeCoord(coordEntity);
    assertCoordEq(coord, decoded);
  }
}
