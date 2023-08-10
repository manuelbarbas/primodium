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

  //todo: delete this
  function testHashKeyEntityItems() public {
    // Hashing edge cases discovered in #36 with leading zeroes (world.entityIndex on client trims leading zeroes)
    // AdvancedPowerSourceCraftedItemID 11699589371590179690663298539456535383454944084246709593455824231284844824000
    // PenetratorFactoryID 97993341068949256531366201596922953741936964741343840392882074207030726058262
    // Hash: 0x000af0440d92c89680faa8b8c174a3d9e85853d832be6c58b4aa6d745554b924
    // TitaniumResourceItemID 29592648218955693310631313341848988444781730640864177349094518031889847668484
    // ProjectileLauncherResearchID 115710791415720365844662016873039814882667321015852259562238368675311117449333
    // Hash: 0x001cb5c6e893b51d92e512213945e99c9341f84f69f9128a2184c70b4e196249
    // bytes32 clientTestOne = bytes32(LibEncode.hashKeyEntity(AdvancedPowerSourceCraftedItemID, PenetratorFactoryID));
    // assertEq(clientTestOne, 0x000af0440d92c89680faa8b8c174a3d9e85853d832be6c58b4aa6d745554b924);
    // bytes32 clientTestTwo = bytes32(LibEncode.hashKeyEntity(TitaniumResourceItemID, ProjectileLauncherResearchID));
    // assertEq(clientTestTwo, 0x001cb5c6e893b51d92e512213945e99c9341f84f69f9128a2184c70b4e196249);
  }

  function testCoordEncoding() public {
    Coord memory coord = Coord({ x: 1, y: 2, parent: 0 });
    uint256 coordEntity = LibEncode.encodeCoord(Coord({ x: 1, y: 2, parent: 1234 }));
    Coord memory decoded = LibEncode.decodeCoord(coordEntity);
    assertCoordEq(coord, decoded);
  }

  function testFuzzCoordEncoding(int32 x, int32 y) public {
    Coord memory coord = Coord(x, y, 0);
    uint256 coordEntity = LibEncode.encodeCoord(coord);
    Coord memory decoded = LibEncode.decodeCoord(coordEntity);
    assertCoordEq(coord, decoded);
  }
}
