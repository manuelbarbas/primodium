// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibResourceTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 unitPrototype = "unitPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(buildingEntity, playerEntity);
  }

  function testClaimAllResourcesBasic() public {
    MaxResourceCount.set(playerEntity, Iron, 1000);
    ProductionRate.set(playerEntity, Iron, 10);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, Iron), 100);
  }

  function testClaimAllResourcesLessThanMax() public {
    MaxResourceCount.set(playerEntity, Iron, 50);
    ProductionRate.set(playerEntity, Iron, 10);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, Iron), 50);
  }

  function testClaimAllResourcesZeroProductionRate() public {
    MaxResourceCount.set(playerEntity, Iron, 1000);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, Iron), 0);
  }

  function testClaimAllResourcesIsUtility() public {
    MaxResourceCount.set(playerEntity, Iron, 1000);
    ProductionRate.set(playerEntity, Iron, 10);
    P_IsUtility.set(Iron, true);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, Iron), 0);
  }

  function testSpendBuildingRequiredResource() public {
    ResourceCount.set(playerEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(playerEntity, Iron), 50);
  }

  function testFailSpendBuildingRequiredResourceInsufficient() public {
    ResourceCount.set(playerEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, level);
  }

  function testSpendBuildingRequiredUtility() public {
    P_IsUtility.set(Iron, true);
    ResourceCount.set(playerEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level + 1, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(playerEntity, Iron), 50);
    assertEq(UtilitySet.get(buildingEntity, Iron), 50);

    LibResource.spendBuildingRequiredResources(buildingEntity, level + 1);
    assertEq(ResourceCount.get(playerEntity, Iron), 0);
    assertEq(UtilitySet.get(buildingEntity, Iron), 100);
  }

  function testFailSpendBuildingRequiredUtilityInsufficient() public {
    P_IsUtility.set(Iron, true);
    ResourceCount.set(playerEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, 1, requiredResourcesData);

    LibResource.spendBuildingRequiredResources(buildingEntity, 1);
  }

  function testSpendUnitRequiredResource() public {
    ResourceCount.set(playerEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(playerEntity, unitPrototype);
    assertEq(ResourceCount.get(playerEntity, Iron), 50);
  }

  function testFailSpendUnitRequiredResourceInsufficient() public {
    ResourceCount.set(playerEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(playerEntity, unitPrototype);
  }

  function testSpendUnitRequiredUtility() public {
    ResourceCount.set(playerEntity, Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(playerEntity, unitPrototype);
    assertEq(ResourceCount.get(playerEntity, Iron), 50);
  }

  function testFailSpendUnitRequiredUtilityInsufficient() public {
    ResourceCount.set(playerEntity, Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(unitPrototype, 0, requiredResourcesData);

    LibResource.spendUnitRequiredResources(playerEntity, unitPrototype);
  }

  function testClearUtilityUsage() public {
    MaxResourceCount.set(playerEntity, Iron, 1000);
    P_IsUtility.set(Iron, true);
    UtilitySet.set(buildingEntity, Iron, 50);
    ResourceCount.set(playerEntity, Iron, 100);

    LibResource.clearUtilityUsage(playerEntity, buildingEntity);

    assertEq(ResourceCount.get(playerEntity, Iron), 150);
    assertEq(UtilitySet.get(buildingEntity, Iron), 0);
  }

  function testGetAllResourceCounts() public {
    ResourceCount.set(playerEntity, Iron, 100);
    ResourceCount.set(playerEntity, Copper, 200);
    ResourceCount.set(playerEntity, Platinum, 500);
    ResourceCount.set(playerEntity, Kimberlite, 1500);

    (uint256 totalResources, uint256[] memory resources) = LibResource.getAllResourceCounts(playerEntity);

    assertEq(totalResources, 2300);
    assertEq(resources[uint8(Iron)], 100);
    assertEq(resources[uint8(Copper)], 200);
    assertEq(resources[uint8(Lithium)], 0);
    assertEq(resources[uint8(Platinum)], 500);
    assertEq(resources[uint8(Kimberlite)], 1500);
  }
}
