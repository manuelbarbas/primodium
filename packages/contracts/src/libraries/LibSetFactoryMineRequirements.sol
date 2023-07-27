// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetFactoryMineRequirements {
  function setFactory1MineRequirement(
    MinesComponent minesComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    ResourceValues memory factoryMines;
    factoryMines.resources = new uint256[](1);
    factoryMines.resources[0] = mineBuildingId1;
    factoryMines.values = new uint32[](1);
    factoryMines.values[0] = numMineBuilding1;

    minesComponent.set(buildingIdLevel, factoryMines);
  }

  function setFactory2MineRequirement(
    MinesComponent minesComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1,
    uint256 mineBuildingId2,
    uint32 numMineBuilding2
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    ResourceValues memory factoryMines;
    factoryMines.resources = new uint256[](2);
    factoryMines.resources[0] = mineBuildingId1;
    factoryMines.resources[1] = mineBuildingId2;
    factoryMines.values = new uint32[](2);
    factoryMines.values[0] = numMineBuilding1;
    factoryMines.values[1] = numMineBuilding2;

    minesComponent.set(buildingIdLevel, factoryMines);
  }

  function setFactory3MineRequirement(
    MinesComponent minesComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1,
    uint256 mineBuildingId2,
    uint32 numMineBuilding2,
    uint256 mineBuildingId3,
    uint32 numMineBuilding3
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    ResourceValues memory factoryMines;
    factoryMines.resources = new uint256[](3);
    factoryMines.resources[0] = mineBuildingId1;
    factoryMines.resources[1] = mineBuildingId2;
    factoryMines.resources[2] = mineBuildingId3;
    factoryMines.values = new uint32[](3);
    factoryMines.values[0] = numMineBuilding1;
    factoryMines.values[1] = numMineBuilding2;
    factoryMines.values[2] = numMineBuilding3;

    minesComponent.set(buildingIdLevel, factoryMines);
  }

  function setFactory3MineRequirement(
    MinesComponent minesComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1,
    uint256 mineBuildingId2,
    uint32 numMineBuilding2,
    uint256 mineBuildingId3,
    uint32 numMineBuilding3,
    uint256 mineBuildingId4,
    uint32 numMineBuilding4
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    ResourceValues memory factoryMines;
    factoryMines.resources = new uint256[](4);
    factoryMines.resources[0] = mineBuildingId1;
    factoryMines.resources[1] = mineBuildingId2;
    factoryMines.resources[2] = mineBuildingId3;
    factoryMines.resources[3] = mineBuildingId4;
    factoryMines.values = new uint32[](4);
    factoryMines.values[0] = numMineBuilding1;
    factoryMines.values[1] = numMineBuilding2;
    factoryMines.values[2] = numMineBuilding3;
    factoryMines.values[3] = numMineBuilding4;

    minesComponent.set(buildingIdLevel, factoryMines);
  }
}
