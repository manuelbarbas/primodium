// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource, EBuilding } from "src/Types.sol";

import { IsActive, ConsumptionRate, Home, Level, BuildingType, OwnedBy, MaxResourceCount, ProductionRate, LastClaimedAt, P_ConsumesResource, ResourceCount, P_Transportables, ResourceCount, P_RequiredResources, P_RequiredResourcesData, P_IsUtility } from "codegen/index.sol";

import { LibResource } from "libraries/LibResource.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";
import { LibBuilding } from "src/libraries/LibBuilding.sol";

contract LibResourceTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 unitPrototype = "unitPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    spawn(creator);
    vm.startPrank(creator);
    playerEntity = addressToEntity(creator);
    bytes32 asteroidEntity = Home.get(playerEntity);
    Level.set(asteroidEntity, 8);
    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(buildingEntity, asteroidEntity);
  }

  function testClaimAllResourcesCommon() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ProductionRate.set(asteroidEntity, Iron, 10);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 100);
  }

  function testClaimAllResourcesConsumptionCommon() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Copper, 1000);
    ProductionRate.set(asteroidEntity, Copper, 10);
    P_ConsumesResource.set(Copper, Iron);

    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ResourceCount.set(asteroidEntity, Iron, 1000);

    ConsumptionRate.set(asteroidEntity, Iron, 100);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 0, "iron doesn't match");
    assertEq(ResourceCount.get(asteroidEntity, Copper), 100, "copper doesn't match");
  }

  function testClaimAllResourcesConsumptionRunOutCommon() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Copper, 1000);
    ProductionRate.set(asteroidEntity, Copper, 10);
    P_ConsumesResource.set(Copper, Iron);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ResourceCount.set(asteroidEntity, Iron, 500);

    ConsumptionRate.set(asteroidEntity, Iron, 100);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Copper), 50);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 0);
  }

  function testClaimAllResourcesLessThanMax() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 50);
    ProductionRate.set(asteroidEntity, Iron, 10);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
  }

  function testClaimAllResourcesZeroProductionRate() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 0);
  }

  function testClaimAllResourcesIsUtility() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    ProductionRate.set(asteroidEntity, Iron, 10);
    P_IsUtility.set(Iron, true);
    LastClaimedAt.set(asteroidEntity, block.timestamp - 10);
    LibResource.claimAllResources(asteroidEntity);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 0);
  }

  function testSpendBuildingRequiredResource() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
  }

  function testFailSpendBuildingRequiredResourceInsufficient() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, level);
  }

  function testSpendBuildingRequiredUtility() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    P_IsUtility.set(Iron, true);
    ResourceCount.set(asteroidEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level + 1, requiredResourcesData);
    IsActive.set(buildingEntity, true);
    LibResource.spendBuildingRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
    assertEq(UtilityMap.get(buildingEntity, Iron), 50);

    LibResource.spendBuildingRequiredResources(buildingEntity, level + 1);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 0);
    assertEq(UtilityMap.get(buildingEntity, Iron), 100);
  }

  function testFailSpendBuildingRequiredUtilityInsufficient() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    P_IsUtility.set(Iron, true);
    ResourceCount.set(asteroidEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, 1, requiredResourcesData);
    IsActive.set(buildingEntity, true);
    LibResource.spendBuildingRequiredResources(buildingEntity, 1);
  }

  function testSpendUnitRequiredResource() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(asteroidEntity, unitPrototype, 1);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
  }

  function testFailSpendUnitRequiredResourceInsufficient() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(asteroidEntity, unitPrototype, 1);
  }

  function testSpendUnitRequiredUtility() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(asteroidEntity, unitPrototype, 1);
    assertEq(ResourceCount.get(asteroidEntity, Iron), 50);
  }

  function testFailSpendUnitRequiredUtilityInsufficient() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(asteroidEntity, unitPrototype, 1);
  }

  function testClearUtilityUsage() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    MaxResourceCount.set(asteroidEntity, Iron, 1000);
    P_IsUtility.set(Iron, true);
    UtilityMap.set(buildingEntity, Iron, 50);
    ResourceCount.set(asteroidEntity, Iron, 100);
    IsActive.set(buildingEntity, true);
    LibResource.clearUtilityUsage(buildingEntity);

    assertEq(ResourceCount.get(asteroidEntity, Iron), 150);
    assertEq(UtilityMap.get(buildingEntity, Iron), 0);
  }

  function testGetAllResourceCounts() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    ResourceCount.set(asteroidEntity, Iron, 100);
    ResourceCount.set(asteroidEntity, Copper, 200);
    ResourceCount.set(asteroidEntity, Platinum, 500);
    ResourceCount.set(asteroidEntity, Kimberlite, 1500);

    (uint256[] memory resources, uint256 totalResources) = LibResource.getStoredResourceCountsVaulted(asteroidEntity);

    uint8[] memory transportables = P_Transportables.get();

    assertEq(totalResources, 2300);
    for (uint256 i = 0; i < transportables.length; i++) {
      if (transportables[i] == uint8(Iron)) {
        assertEq(resources[i], 100);
      } else if (transportables[i] == uint8(Copper)) {
        assertEq(resources[i], 200);
      } else if (transportables[i] == uint8(Platinum)) {
        assertEq(resources[i], 500);
      } else if (transportables[i] == uint8(Kimberlite)) {
        assertEq(resources[i], 1500);
      } else {
        assertEq(resources[i], 0);
      }
    }
  }

  function testResourceClaimUnderflow() public {
    bytes32 asteroidEntity = Home.get(playerEntity);
    bytes32 mainbaseEntity = Home.get(asteroidEntity);
    LibBuilding.upgradeBypassChecks(mainbaseEntity);
    LibBuilding.upgradeBypassChecks(mainbaseEntity);
    LibBuilding.upgradeBypassChecks(mainbaseEntity);
    LibBuilding.upgradeBypassChecks(mainbaseEntity);

    uint256 startingResourceCount = 1000;

    increaseResource(asteroidEntity, EResource.Iron, startingResourceCount);
    increaseResource(asteroidEntity, EResource.Lithium, startingResourceCount);
    buildBuilding(creator, EBuilding.IronMine);
    buildBuilding(creator, EBuilding.IronPlateFactory);
    buildBuilding(creator, EBuilding.IronPlateFactory);
    buildBuilding(creator, EBuilding.IronPlateFactory);

    vm.warp(block.timestamp + 1000000);

    buildBuilding(creator, EBuilding.IronMine);
  }
}
