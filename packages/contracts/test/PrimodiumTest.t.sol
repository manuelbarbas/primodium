// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
import { getKeysWithValue } from "@latticexyz/world/src/modules/keyswithvalue/getKeysWithValue.sol";
import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";

import "codegen/world/IWorld.sol";
import "codegen/Tables.sol";
import "codegen/Types.sol";
import "libraries/Libraries.sol";

struct PositionData2D {
  int32 x;
  int32 y;
}

contract PrimodiumTest is MudTest {
  IWorld public world;

  function setUp() public virtual override {
    super.setUp();
    world = IWorld(worldAddress);
  }

  modifier prank(address prankster) {
    vm.startPrank(prankster);
    _;
    vm.stopPrank();
  }

  function assertEq(PositionData memory coordA, PositionData memory coordB) internal {
    assertEq(coordA.x, coordB.x, "[assertEq]: x doesn't match");
    assertEq(coordA.y, coordB.y, "[assertEq]: y doesn't match");
    assertEq(coordA.parent, coordB.parent, "[assertEq]: parent doesn't match");
  }

  function assertEq(ERock a, ERock b) internal {
    assertEq(uint256(a), uint256(b));
  }

  function assertEq(
    ERock a,
    ERock b,
    string memory context
  ) internal {
    assertEq(uint256(a), uint256(b), context);
  }

  function getHomeAsteroidEntity(address player) public view returns (bytes32) {
    return Position.get(LibEncode.addressToEntity(player)).parent;
  }

  function getHomeAsteroid(address player) public view returns (PositionData memory) {
    bytes32 asteroid = Position.get(LibEncode.addressToEntity(player)).parent;
    return Position.get(asteroid);
  }

  function logPosition(PositionData memory coord) internal view {
    console.log("x");
    console.logInt(coord.x);
    console.log("y");
    console.logInt(coord.y);
    console.log("parent", ResourceSelector.toString(coord.parent));
  }

  function getPosition1(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord1 = PositionData2D(15, 12);
    return getPosition(coord1, player);
  }

  function getPosition2(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord2 = PositionData2D(23, 17);
    return getPosition(coord2, player);
  }

  function getPosition3(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord3 = PositionData2D(13, 8);
    return getPosition(coord3, player);
  }

  function getIronPosition(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 8);
    return getPosition(coord, player);
  }

  function getCopperPosition(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(20, 15);
    return getPosition(coord, player);
  }

  function getNonIronPosition(address player) internal view returns (PositionData memory) {
    PositionData2D memory coord = PositionData2D(8, 15);
    return getPosition(coord, player);
  }

  function getPosition(
    int32 x,
    int32 y,
    address player
  ) internal view returns (PositionData memory coord) {
    return getPosition(PositionData2D(x, y), player);
  }

  function getPosition(PositionData2D memory coord2D, address player)
    internal
    view
    returns (PositionData memory coord)
  {
    bytes32 playerEntity = LibEncode.addressToEntity(player);
    bytes32 asteroid = LibEncode.getHash(worldAddress, playerEntity);

    coord = PositionData(coord2D.x, coord2D.y, asteroid);
  }
}
