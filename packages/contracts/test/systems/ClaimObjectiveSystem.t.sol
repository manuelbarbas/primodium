// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EBuilding, EResource, EObjectives } from "src/Types.sol";
import { BuildingKey, ObjectiveKey, PirateKey } from "src/Keys.sol";

import { P_HasBuiltBuildings, P_SpawnPirateAsteroidData, P_DestroyedUnits, CompletedObjective, P_ProducedResources, P_RequiredUnits, ProducedUnit, P_SpawnPirateAsteroid, ReversePosition, LastClaimedAt, P_IsUtility, P_UnitPrototypes, P_ResourceRewardData, P_ResourceReward, P_RequiredObjectives, UnitCount, P_RaidedResources, PirateAsteroid, P_ProducedUnitsData, P_ProducedUnits, P_RequiredUnitsData, P_DestroyedUnitsData, P_RaidedResourcesData, P_UnitReward, P_ProducedResourcesData, P_UnitRewardData, P_RequiredResourcesData, P_RequiredBaseLevel, P_EnumToPrototype, Position, PositionData, Level, Home, P_RequiredResources, ResourceCount, P_Production, MaxResourceCount } from "codegen/index.sol";

import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibProduction } from "libraries/LibProduction.sol";

contract ClaimObjectiveSystemTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 asteroidEntity;

  function setUp() public override {
    super.setUp();
    playerEntity = addressToEntity(creator);
    asteroidEntity = spawn(creator);
    vm.startPrank(creator);
  }

  function testFailClaimInvalidObjective() public {
    world.Primodium__claimObjective(asteroidEntity, EObjectives.LENGTH);
  }

  function testClaimObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    console.log("claiming objective", uint256(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine))));
    MaxResourceCount.set(asteroidEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
    assertEq(
      ResourceCount.get(asteroidEntity, uint8(EResource.Iron)),
      resourceRewardData.amounts[0],
      "Resource does not match"
    );
  }

  function testClaimObjectiveReceiveResourceRewards() public {
    ResourceCount.set(asteroidEntity, uint8(EResource.Iron), 0);
    MaxResourceCount.set(asteroidEntity, uint8(EResource.Iron), 100);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);
    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
    assertEq(
      ResourceCount.get(asteroidEntity, uint8(EResource.Iron)),
      resourceRewardData.amounts[0],
      "Resource does not match"
    );
  }

  function testFailClaimObjectiveReceiveResourceRewards() public {
    ResourceCount.set(asteroidEntity, uint8(EResource.Iron), 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);
    MaxResourceCount.set(asteroidEntity, uint8(EResource.Iron), 0);
    console.log(ResourceCount.get(asteroidEntity, uint8(EResource.Iron)));
    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
    console.log(ResourceCount.get(asteroidEntity, uint8(EResource.Iron)));
  }

  function testClaimObjectiveReceiveUnitRewards() public {
    UnitCount.set(Home.get(playerEntity), unit1, 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_UnitRewardData memory unitRewardData = P_UnitRewardData(new bytes32[](1), new uint256[](1));
    unitRewardData.units[0] = unit1;
    unitRewardData.amounts[0] = 100;
    P_UnitReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), unitRewardData);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.U_Housing);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    // provide the required housing
    LibProduction.increaseResourceProduction(asteroidEntity, EResource.U_Housing, 100);

    MaxResourceCount.set(asteroidEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
    assertEq(UnitCount.get(Home.get(playerEntity), unit1), unitRewardData.amounts[0], "Unit count does not match");
  }

  function testFailClaimObjectiveReceiveUnitRewards() public {
    UnitCount.set(Home.get(playerEntity), unit1, 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_UnitRewardData memory unitRewardData = P_UnitRewardData(new bytes32[](1), new uint256[](1));
    unitRewardData.units[0] = unit1;
    unitRewardData.amounts[0] = 100;
    P_UnitReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), unitRewardData);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.U_Housing);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
  }

  function testFailClaimObjectiveTwice() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
    world.Primodium__claimObjective(asteroidEntity, EObjectives.BuildIronMine);
  }
}
