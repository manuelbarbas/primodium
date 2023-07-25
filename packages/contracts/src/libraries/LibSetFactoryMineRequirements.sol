pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetFactoryMineRequirements {
  function setFactory1MineRequirement(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    FactoryMineBuildingsData memory factoryMineBuildingsData;
    factoryMineBuildingsData.MineBuildingIDs = new uint256[](1);
    factoryMineBuildingsData.MineBuildingIDs[0] = mineBuildingId1;
    factoryMineBuildingsData.MineBuildingCount = new uint32[](1);
    factoryMineBuildingsData.MineBuildingCount[0] = numMineBuilding1;

    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);
  }

  function setFactory2MineRequirement(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    uint256 factoryBuildingId,
    uint32 level,
    uint256 mineBuildingId1,
    uint32 numMineBuilding1,
    uint256 mineBuildingId2,
    uint32 numMineBuilding2
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(factoryBuildingId, level);
    FactoryMineBuildingsData memory factoryMineBuildingsData;
    factoryMineBuildingsData.MineBuildingIDs = new uint256[](2);
    factoryMineBuildingsData.MineBuildingIDs[0] = mineBuildingId1;
    factoryMineBuildingsData.MineBuildingIDs[1] = mineBuildingId2;
    factoryMineBuildingsData.MineBuildingCount = new uint32[](2);
    factoryMineBuildingsData.MineBuildingCount[0] = numMineBuilding1;
    factoryMineBuildingsData.MineBuildingCount[1] = numMineBuilding2;

    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);
  }

  function setFactory3MineRequirement(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
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
    FactoryMineBuildingsData memory factoryMineBuildingsData;
    factoryMineBuildingsData.MineBuildingIDs = new uint256[](3);
    factoryMineBuildingsData.MineBuildingIDs[0] = mineBuildingId1;
    factoryMineBuildingsData.MineBuildingIDs[1] = mineBuildingId2;
    factoryMineBuildingsData.MineBuildingIDs[2] = mineBuildingId3;
    factoryMineBuildingsData.MineBuildingCount = new uint32[](3);
    factoryMineBuildingsData.MineBuildingCount[0] = numMineBuilding1;
    factoryMineBuildingsData.MineBuildingCount[1] = numMineBuilding2;
    factoryMineBuildingsData.MineBuildingCount[2] = numMineBuilding3;

    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);
  }

  function setFactory3MineRequirement(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
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
    FactoryMineBuildingsData memory factoryMineBuildingsData;
    factoryMineBuildingsData.MineBuildingIDs = new uint256[](4);
    factoryMineBuildingsData.MineBuildingIDs[0] = mineBuildingId1;
    factoryMineBuildingsData.MineBuildingIDs[1] = mineBuildingId2;
    factoryMineBuildingsData.MineBuildingIDs[2] = mineBuildingId3;
    factoryMineBuildingsData.MineBuildingIDs[3] = mineBuildingId4;
    factoryMineBuildingsData.MineBuildingCount = new uint32[](4);
    factoryMineBuildingsData.MineBuildingCount[0] = numMineBuilding1;
    factoryMineBuildingsData.MineBuildingCount[1] = numMineBuilding2;
    factoryMineBuildingsData.MineBuildingCount[2] = numMineBuilding3;
    factoryMineBuildingsData.MineBuildingCount[3] = numMineBuilding4;

    factoryMineBuildingsComponent.set(buildingIdLevel, factoryMineBuildingsData);
  }
}
