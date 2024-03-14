// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibBuildingTest is PrimodiumTest {
  bytes32 player;
  function setUp() public override {
    super.setUp();
    spawn(creator);
    player = addressToEntity(creator);
    vm.startPrank(creator);
  }

  function testGetPlayerBounds(int16 maxX, int16 maxY, int16 currX, int16 currY) public {
    // Bound fuzzy parameters to int16 to eliminate overflow errors when testing
    vm.assume(currX > 0);
    vm.assume(currY > 0);
    vm.assume(maxX >= currX);
    vm.assume(maxY >= currY);

    P_Asteroid.set(maxX, maxY);

    bytes32 playerEntity = addressToEntity(creator);
    uint256 playerLevel = Level.get(Home.get(playerEntity));

    Dimensions.set(ExpansionKey, playerLevel, currX, currY);

    Bounds memory bounds = LibBuilding.getSpaceRockBounds(Home.get(playerEntity));

    assertEq(bounds.minX, (int32(maxX) - int32(currX)) / 2);
    assertEq(bounds.maxX, (int32(maxX) + int32(currX)) / 2 - 1);
    assertEq(bounds.minY, (int32(maxY) - int32(currY)) / 2);
    assertEq(bounds.maxY, (int32(maxY) + int32(currY)) / 2 - 1);

    // Check that the bound size matches with the current player dimensions
    assertEq(currX, bounds.maxX - bounds.minX + 1);
    assertEq(currY, bounds.maxY - bounds.minY + 1);
  }

  /* ------------------------------ Bitmap Tests ------------------------------ */

  function testAllTilesAvailable() public {
    DimensionsData memory dimensions = Dimensions.get(ExpansionKey, P_MaxLevel.get(ExpansionKey));
    Bounds memory bounds = LibBuilding.getSpaceRockBounds(Home.get(player));
    uint256 len = uint256(uint32((bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)));
    int32[] memory xs = new int32[](len);
    int32[] memory ys = new int32[](len);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        uint32 index = uint32(i * dimensions.width + j);
        xs[loopIndex] = i;
        ys[loopIndex] = j;
        loopIndex++;
      }
    }
    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), xs, ys));
  }

  function testSetTile() public {
    int32[] memory setXs = new int32[](1);
    int32[] memory setYs = new int32[](1);
    setXs[0] = 15;
    setYs[0] = 15;
    //
    LibAsteroid.setTiles(Home.get(addressToEntity(creator)), setXs, setYs);

    Bounds memory bounds = LibBuilding.getSpaceRockBounds(Home.get(player));
    uint256 len = uint256(uint32((bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)));
    int32[] memory xs = new int32[](len);
    int32[] memory ys = new int32[](len);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        uint32 index = uint32(i * 10 + j);
        xs[loopIndex] = i;
        ys[loopIndex] = j;
        loopIndex++;
      }
    }
    assertFalse(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), xs, ys));

    xs = new int32[](len - 1);
    ys = new int32[](len - 1);
    loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        if (i == 15 && j == 15) {
          continue;
        }
        xs[loopIndex] = i;
        ys[loopIndex] = j;
        loopIndex++;
      }
    }

    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), xs, ys));
  }

  function testRemoveTiles() public {
    // Set a tile at (15, 15) as in testSetTile
    int32[] memory setXs = new int32[](1);
    int32[] memory setYs = new int32[](1);
    setXs[0] = 15;
    setYs[0] = 15;
    LibAsteroid.setTiles(Home.get(addressToEntity(creator)), setXs, setYs);

    // Remove the tile at (15, 15)
    LibAsteroid.removeTiles(Home.get(addressToEntity(creator)), setXs, setYs);

    // Verify that the tile at (15, 15) is available again
    Bounds memory bounds = LibBuilding.getSpaceRockBounds(Home.get(player));
    uint256 len = uint256(uint32((bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY)));
    int32[] memory xs = new int32[](len);
    int32[] memory ys = new int32[](len);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.maxX; i++) {
      for (int32 j = bounds.minY; j < bounds.maxY; j++) {
        xs[loopIndex] = i;
        ys[loopIndex] = j;
        loopIndex++;
      }
    }

    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), xs, ys));
  }
}
