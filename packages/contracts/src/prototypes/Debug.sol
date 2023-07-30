// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

//buildings
uint256 constant DebugSimpleBuildingNoReqsID = uint256(keccak256("block.DebugSimpleBuildingNoReqs"));
uint256 constant DebugSimpleBuildingResourceReqsID = uint256(keccak256("block.DebugSimpleBuildingResourceReqs"));
uint256 constant DebugSimpleBuildingResearchReqsID = uint256(keccak256("block.DebugSimpleBuildingResearchReqs"));
uint256 constant DebugSimpleBuildingBuildLimitReq = uint256(keccak256("block.DebugSimpleBuildingBuildLimitReq"));
uint256 constant DebugSimpleBuildingTileReqID = uint256(keccak256("block.DebugSimpleBuildingTileReq"));

uint256 constant DebugSimpleBuildingPassiveResourceRequirement = uint256(
  keccak256("block.DebugSimpleBuildingPassiveResourceRequirement")
);

uint256 constant DebugSimpleBuildingWithUpgradeResourceReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResourceReqs")
);
uint256 constant DebugSimpleBuildingWithUpgradeResearchReqsID = uint256(
  keccak256("block.DebugSimpleBuildingWithUpgradeResearchReqs")
);

uint256 constant DebugSimpleBuilding3x3 = uint256(keccak256("block.DebugSimpleBuilding3x3"));

// mines
uint256 constant DebugIronMineID = uint256(keccak256("block.DebugIronMine"));
uint256 constant DebugCopperMineID = uint256(keccak256("block.DebugCopperMine"));
uint256 constant DebugLithiumMineID = uint256(keccak256("block.DebugLithiumMine"));

uint256 constant DebugIronMineWithBuildLimitID = uint256(keccak256("block.DebugIronMineWithBuildLimit"));
uint256 constant DebugIronMineNoTileReqID = uint256(keccak256("block.DebugIronMineNoTileReq"));

//factories
uint256 constant DebugIronPlateFactoryNoMineReqID = uint256(keccak256("block.DebugIronPlateFactoryNoMineReq"));
uint256 constant DebugIronPlateFactoryID = uint256(keccak256("block.DebugIronPlateFactory"));
uint256 constant DebugAlloyFactoryID = uint256(keccak256("block.DebugAlloyFactory"));
uint256 constant DebugLithiumCopperOxideFactoryID = uint256(keccak256("block.DebugLithiumCopperOxideFactory"));

uint256 constant DebugSolarPanelID = uint256(keccak256("block.DebugSolarPanel"));

uint256 constant DebugPassiveProductionBuilding = uint256(keccak256("block.DebugPassiveProductionBuilding"));

//super buildings
uint256 constant DebugSuperIronMineID = uint256(keccak256("block.DebugSuperIronMine"));
uint256 constant DebugSuperIronPlateFactoryID = uint256(keccak256("block.DebugSuperIronPlateFactory"));
//technologies
uint256 constant DebugSimpleTechnologyNoReqsID = uint256(keccak256("block.DebugSimpleTechnologyNoReqs"));
uint256 constant DebugSimpleTechnologyResourceReqsID = uint256(keccak256("block.DebugSimpleTechnologyResourceReqs"));
uint256 constant DebugSimpleTechnologyResearchReqsID = uint256(keccak256("block.DebugSimpleTechnologyResearchReqs"));
uint256 constant DebugSimpleTechnologyMainBaseLevelReqsID = uint256(
  keccak256("block.DebugSimpleTechnologyMainBaseLevelReqs")
);

//storage building
uint256 constant DebugStorageBuildingID = uint256(keccak256("block.DebugStorageBuilding"));
