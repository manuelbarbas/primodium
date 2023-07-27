pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { MinesComponent, ID as MinesComponentID, MinesData } from "components/MinesComponent.sol";
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
    MinesData memory minesData;
    minesData.MineBuildingIDs = new uint256[](1);
    minesData.MineBuildingIDs[0] = mineBuildingId1;
    minesData.MineBuildingCount = new uint32[](1);
    minesData.MineBuildingCount[0] = numMineBuilding1;

    minesComponent.set(buildingIdLevel, minesData);
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
    MinesData memory minesData;
    minesData.MineBuildingIDs = new uint256[](2);
    minesData.MineBuildingIDs[0] = mineBuildingId1;
    minesData.MineBuildingIDs[1] = mineBuildingId2;
    minesData.MineBuildingCount = new uint32[](2);
    minesData.MineBuildingCount[0] = numMineBuilding1;
    minesData.MineBuildingCount[1] = numMineBuilding2;

    minesComponent.set(buildingIdLevel, minesData);
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
    MinesData memory minesData;
    minesData.MineBuildingIDs = new uint256[](3);
    minesData.MineBuildingIDs[0] = mineBuildingId1;
    minesData.MineBuildingIDs[1] = mineBuildingId2;
    minesData.MineBuildingIDs[2] = mineBuildingId3;
    minesData.MineBuildingCount = new uint32[](3);
    minesData.MineBuildingCount[0] = numMineBuilding1;
    minesData.MineBuildingCount[1] = numMineBuilding2;
    minesData.MineBuildingCount[2] = numMineBuilding3;

    minesComponent.set(buildingIdLevel, minesData);
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
    MinesData memory minesData;
    minesData.MineBuildingIDs = new uint256[](4);
    minesData.MineBuildingIDs[0] = mineBuildingId1;
    minesData.MineBuildingIDs[1] = mineBuildingId2;
    minesData.MineBuildingIDs[2] = mineBuildingId3;
    minesData.MineBuildingIDs[3] = mineBuildingId4;
    minesData.MineBuildingCount = new uint32[](4);
    minesData.MineBuildingCount[0] = numMineBuilding1;
    minesData.MineBuildingCount[1] = numMineBuilding2;
    minesData.MineBuildingCount[2] = numMineBuilding3;
    minesData.MineBuildingCount[3] = numMineBuilding4;

    minesComponent.set(buildingIdLevel, minesData);
  }
}
