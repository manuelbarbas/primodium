// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { EObjectives } from "src/Types.sol";
import { ObjectiveKey } from "src/Keys.sol";
import { P_RequiredObjectives } from "codegen/tables/P_RequiredObjectives.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { CompletedObjective } from "codegen/tables/CompletedObjective.sol";
import { OwnedBy } from "codegen/tables/OwnedBy.sol";
import { BuildingType } from "codegen/tables/BuildingType.sol";
import { P_HasBuiltBuildings } from "codegen/tables/P_HasBuiltBuildings.sol";

import "test/PrimodiumTest.t.sol";

contract ClaimObjectiveSystemTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 enemy = "enemy";

  bytes32 unit1 = "unit1";
  bytes32 unit2 = "unit2";

  bytes32 rock = "rock";

  BattleResultData br =
    BattleResultData({
      attacker: playerEntity,
      defender: enemy,
      winner: playerEntity,
      rock: rock,
      totalCargo: 100,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      defenderStartingUnits: getUnitArray(100, 10),
      attackerUnitsLeft: getUnitArray(50, 20),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

  function setUp() public override {
    super.setUp();
    playerEntity = addressToEntity(creator);
    spawn(creator);
    vm.startPrank(creator);
  }

  function setupRaid() internal {
    br.attacker = playerEntity;
    br.winner = playerEntity;
    bytes32[] memory unitTypes = new bytes32[](unitPrototypeCount);
    unitTypes[0] = unit1;
    P_UnitPrototypes.set(unitTypes);

    ResourceCount.set(enemy, Iron, 100);
    P_IsUtility.set(Platinum, true);
    ResourceCount.set(enemy, Platinum, 500);
    LibResource.claimAllResources(playerEntity);
    LibResource.claimAllResources(enemy);
  }

  function testClaimMainBaseLevelObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)), 1, 2);
    Level.set(Home.getMainBase(playerEntity), 2);
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testFailClaimMainBaseLevelObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)), 1, 2);
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testFailClaimInvalidObjective() public {
    world.claimObjective(EObjectives.LENGTH);
  }

  function testFailRequiredClaimObjective() public {
    bytes32[] memory objectives = new bytes32[](1);
    objectives[0] = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine));
    P_RequiredObjectives.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)), objectives);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testClaimObjectiveReceiveResourceRewards() public {
    ResourceCount.set(playerEntity, uint8(EResource.Iron), 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)),
      resourceRewardData
    );
    world.claimObjective(EObjectives.BuildFirstIronMine);
    assertEq(
      ResourceCount.get(playerEntity, uint8(EResource.Iron)),
      resourceRewardData.amounts[0],
      "Resource does not match"
    );
  }

  function testFailClaimObjectiveReceiveResourceRewards() public {
    ResourceCount.set(playerEntity, uint8(EResource.Iron), 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)),
      resourceRewardData
    );
    MaxResourceCount.set(playerEntity, uint8(EResource.Iron), 0);
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testClaimObjectiveReceiveUnitRewards() public {
    UnitCount.set(playerEntity, Home.get(playerEntity).asteroid, unit1, 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_UnitRewardData memory unitRewardData = P_UnitRewardData(new bytes32[](1), new uint256[](1));
    unitRewardData.unitTypes[0] = unit1;
    unitRewardData.amounts[0] = 100;
    P_UnitReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)), unitRewardData);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.U_Housing);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    // provide the required housing
    LibProduction.increaseResourceProduction(playerEntity, EResource.U_Housing, 100);

    world.claimObjective(EObjectives.BuildFirstIronMine);
    assertEq(
      UnitCount.get(playerEntity, Home.get(playerEntity).asteroid, unit1),
      unitRewardData.amounts[0],
      "Unit count does not match"
    );
  }

  function testFailClaimObjectiveReceiveUnitRewards() public {
    UnitCount.set(playerEntity, Home.get(playerEntity).asteroid, unit1, 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    P_UnitRewardData memory unitRewardData = P_UnitRewardData(new bytes32[](1), new uint256[](1));
    unitRewardData.unitTypes[0] = unit1;
    unitRewardData.amounts[0] = 100;
    P_UnitReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)), unitRewardData);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.U_Housing);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testFailClaimObjectiveTwice() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)));
    world.claimObjective(EObjectives.BuildFirstIronMine);
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testClaimObjectiveHasBuiltBuilding() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.claimObjective(EObjectives.BuildFirstIronMine);
  }

  function testClaimObjectiveHasProducedResources() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.claimObjective(EObjectives.BuildFirstIronMine);
    P_ProducedResourcesData memory producedResourcesData = P_ProducedResourcesData(new uint8[](1), new uint256[](1));
    producedResourcesData.resources[0] = uint8(EResource.Iron);
    producedResourcesData.amounts[0] =
      P_Production.get(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1).amount *
      10;
    P_ProducedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      producedResourcesData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    LastClaimedAt.set(playerEntity, block.timestamp - 10);

    world.claimObjective(EObjectives.BuildFirstCopperMine);

    assertEq(
      ResourceCount.get(playerEntity, uint8(EResource.Iron)),
      producedResourcesData.amounts[0],
      "Produced Resource does not match"
    );
  }

  function testFailClaimObjectiveHasProducedResources() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    world.claimObjective(EObjectives.BuildFirstIronMine);
    P_ProducedResourcesData memory producedResourcesData = P_ProducedResourcesData(new uint8[](1), new uint256[](1));
    producedResourcesData.resources[0] = uint8(EResource.Iron);
    producedResourcesData.amounts[0] =
      P_Production.get(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1).amount *
      10;
    P_ProducedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      producedResourcesData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    LastClaimedAt.set(playerEntity, block.timestamp - 5);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjectiveRequiredObjectives() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    bytes32[] memory objectives = new bytes32[](1);
    objectives[0] = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine));
    P_RequiredObjectives.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)), objectives);

    CompletedObjective.set(
      addressToEntity(creator),
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstIronMine)),
      true
    );
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjectiveRaidedResources() public {
    P_RaidedResourcesData memory raidedResourcesData = P_RaidedResourcesData(new uint8[](1), new uint256[](1));
    raidedResourcesData.resources[0] = uint8(EResource.Iron);
    raidedResourcesData.amounts[0] = 100;
    P_RaidedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      raidedResourcesData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));

    setupRaid();
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
    assertEq(
      ResourceCount.get(playerEntity, uint8(EResource.Iron)),
      raidedResourcesData.amounts[0],
      "Produced Resource does not match"
    );
  }

  function testFailClaimObjectiveRaidedResources() public {
    P_RaidedResourcesData memory raidedResourcesData = P_RaidedResourcesData(new uint8[](1), new uint256[](1));
    raidedResourcesData.resources[0] = uint8(EResource.Iron);
    raidedResourcesData.amounts[0] = 100;
    P_RaidedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      raidedResourcesData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjectiveDestroyedUnits() public {
    P_DestroyedUnitsData memory destroyedUnitsData = P_DestroyedUnitsData(new bytes32[](1), new uint256[](1));
    destroyedUnitsData.units[0] = unit1;
    destroyedUnitsData.amounts[0] = 100;
    P_DestroyedUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      destroyedUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));

    setupRaid();
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testFailClaimObjectiveDestroyedUnits() public {
    P_DestroyedUnitsData memory destroyedUnitsData = P_DestroyedUnitsData(new bytes32[](1), new uint256[](1));
    destroyedUnitsData.units[0] = unit1;
    destroyedUnitsData.amounts[0] = 100;
    P_DestroyedUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      destroyedUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));

    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjectiveRequiredUnits() public {
    P_RequiredUnitsData memory requiredUnitsData = P_RequiredUnitsData(new bytes32[](1), new uint256[](1));
    requiredUnitsData.units[0] = unit1;
    requiredUnitsData.amounts[0] = 100;
    P_RequiredUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      requiredUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    UnitCount.set(playerEntity, Home.get(playerEntity).asteroid, unit1, 100);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testFailClaimObjectiveRequiredUnits() public {
    P_RequiredUnitsData memory requiredUnitsData = P_RequiredUnitsData(new bytes32[](1), new uint256[](1));
    requiredUnitsData.units[0] = unit1;
    requiredUnitsData.amounts[0] = 100;
    P_RequiredUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      requiredUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));

    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testClaimObjectiveProducedUnits() public {
    P_ProducedUnitsData memory producedUnitsData = P_ProducedUnitsData(new bytes32[](1), new uint256[](1));
    producedUnitsData.units[0] = unit1;
    producedUnitsData.amounts[0] = 100;
    P_ProducedUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      producedUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));
    ProducedUnit.set(playerEntity, unit1, 100);
    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }

  function testFailClaimObjectiveProducedUnits() public {
    P_ProducedUnitsData memory producedUnitsData = P_ProducedUnitsData(new bytes32[](1), new uint256[](1));
    producedUnitsData.units[0] = unit1;
    producedUnitsData.amounts[0] = 100;
    P_ProducedUnits.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)),
      producedUnitsData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildFirstCopperMine)));

    world.claimObjective(EObjectives.BuildFirstCopperMine);
  }
}
