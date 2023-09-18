// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";
import { EResource } from "src/Types.sol";
import { LibResource, UtilitySet } from "codegen/Libraries.sol";

import { P_RequiredResourcesData, P_RequiredResources, BuildingType, MaxResourceCount, OwnedBy } from "codegen/Tables.sol";

contract LibResourceTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(buildingEntity, playerEntity);
  }

  function testClaimAllResourcesBasic() public {
    MaxResourceCount.set(playerEntity, EResource.Iron, 1000);
    ProductionRate.set(playerEntity, EResource.Iron, 10);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 100);
  }

  function testClaimAllResourcesLessThanMax() public {
    MaxResourceCount.set(playerEntity, EResource.Iron, 50);
    ProductionRate.set(playerEntity, EResource.Iron, 10);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 50);
  }

  function testClaimAllResourcesZeroProductionRate() public {
    MaxResourceCount.set(playerEntity, EResource.Iron, 1000);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 0);
  }

  function testClaimAllResourcesIsUtility() public {
    MaxResourceCount.set(playerEntity, EResource.Iron, 1000);
    ProductionRate.set(playerEntity, EResource.Iron, 10);
    P_IsUtility.set(EResource.Iron, true);
    LastClaimedAt.set(playerEntity, block.timestamp - 10);
    LibResource.claimAllResources(playerEntity);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 0);
  }

  function testSpendRequiredResource() public {
    ResourceCount.set(playerEntity, EResource.Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 50);
  }

  function testFailSpendRequiredResourceInsufficient() public {
    ResourceCount.set(playerEntity, EResource.Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendRequiredResources(buildingEntity, level);
  }

  function testSpendRequiredUtility() public {
    ResourceCount.set(playerEntity, EResource.Iron, 100);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, level, requiredResourcesData);

    LibResource.spendRequiredResources(buildingEntity, level);
    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 50);
  }

  function testFailSpendRequiredUtilityInsufficient() public {
    ResourceCount.set(playerEntity, EResource.Iron, 30);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.Iron);
    requiredResourcesData.amounts[0] = 50;
    P_RequiredResources.set(buildingPrototype, 1, requiredResourcesData);

    LibResource.spendRequiredResources(buildingEntity, 1);
  }

  function testClearUtilityUsage() public {
    MaxResourceCount.set(playerEntity, EResource.Iron, 1000);
    P_IsUtility.set(EResource.Iron, true);
    UtilitySet.set(buildingEntity, EResource.Iron, 50);
    ResourceCount.set(playerEntity, EResource.Iron, 100);

    LibResource.clearUtilityUsage(playerEntity, buildingEntity);

    assertEq(ResourceCount.get(playerEntity, EResource.Iron), 150);
    assertEq(UtilitySet.get(buildingEntity, EResource.Iron), 0);
  }
}
