// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { ExpansionKey } from "src/Keys.sol";

import { P_MaxLevel, Dimensions, Level, Home, P_Asteroid, DimensionsData } from "codegen/index.sol";

import { Bounds } from "src/Types.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

contract LibBuildingTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  function testGetPlayerBounds(int16 maxX, int16 maxY, int16 currX, int16 currY) public {
    // Bound fuzzy parameters to int16 to eliminate overflow errors when testing
    vm.assume(currX > 0);
    vm.assume(currY > 0);
    vm.assume(maxX >= currX);
    vm.assume(maxY >= currY);

    P_Asteroid.set(maxX, maxY);

    uint256 playerLevel = Level.get(Home.get(playerEntity));

    Dimensions.set(ExpansionKey, playerLevel, currX, currY);

    Bounds memory bounds = LibBuilding.getAsteroidBounds(Home.get(playerEntity));

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
    Bounds memory bounds = LibBuilding.getAsteroidBounds(Home.get(playerEntity));
    uint256 len = 4;
    int32[] memory coordsToCheck = new int32[](len * 2);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.minX + 2; i++) {
      for (int32 j = bounds.minY; j < bounds.minY + 2; j++) {
        coordsToCheck[loopIndex] = i;
        coordsToCheck[loopIndex + 1] = j;
        loopIndex += 2;
      }
    }
    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), coordsToCheck));
  }

  function testSetTile() public {
    int32[] memory coords = new int32[](2);
    Bounds memory bounds = LibBuilding.getAsteroidBounds(Home.get(playerEntity));
    coords[0] = bounds.minX;
    coords[1] = bounds.minY;
    //
    LibAsteroid.setTiles(Home.get(addressToEntity(creator)), coords);

    uint256 len = 4;
    int32[] memory coordsToCheck = new int32[](len * 2);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.minX + 2; i++) {
      for (int32 j = bounds.minY; j < bounds.minY + 2; j++) {
        coordsToCheck[loopIndex] = i;
        coordsToCheck[loopIndex + 1] = j;
        loopIndex += 2;
      }
    }
    assertFalse(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), coordsToCheck));

    coordsToCheck = new int32[](len * 2 - 2);
    loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.minX + 2; i++) {
      for (int32 j = bounds.minY; j < bounds.minY + 2; j++) {
        if (i == bounds.minX && j == bounds.minY) {
          continue;
        }
        coordsToCheck[loopIndex] = i;
        coordsToCheck[loopIndex + 1] = j;
        loopIndex += 2;
      }
    }

    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), coordsToCheck));
  }

  function testRemoveTiles() public {
    Bounds memory bounds = LibBuilding.getAsteroidBounds(Home.get(playerEntity));
    // Set a tile at (15, 15) as in testSetTile
    int32[] memory coords = new int32[](2);
    coords[0] = bounds.minX;
    coords[1] = bounds.minY;

    LibAsteroid.setTiles(Home.get(addressToEntity(creator)), coords);

    // Remove the tile at (15, 15)
    LibAsteroid.removeTiles(Home.get(addressToEntity(creator)), coords);

    // Verify that the tile at (15, 15) is available again
    uint256 len = 4;
    int32[] memory coordsToCheck = new int32[](len * 2);

    uint256 loopIndex = 0;
    for (int32 i = bounds.minX; i < bounds.minX + 2; i++) {
      for (int32 j = bounds.minY; j < bounds.minY + 2; j++) {
        coordsToCheck[loopIndex] = i;
        coordsToCheck[loopIndex + 1] = j;
        loopIndex += 2;
      }
    }

    assertTrue(LibAsteroid.allTilesAvailable(Home.get(addressToEntity(creator)), coordsToCheck));
  }
}
