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
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
    P_UnitPrototypes.set(unitTypes);
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    Home.setAsteroid(enemy, rock);
    MaxResourceCount.set(
      spaceRockEntity,
      uint8(EResource.Iron),
      MaxResourceCount.get(spaceRockEntity, uint8(EResource.Iron)) + 100
    );
    ResourceCount.set(rock, Iron, 100);
    P_IsUtility.set(Platinum, true);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Platinum), 1000);
    ResourceCount.set(rock, Platinum, 500);
    LibResource.claimAllResources(spaceRockEntity);
    LibResource.claimAllResources(rock);
  }

  function testClaimMainBaseLevelObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), 1, 2);
    Level.set(Home.getMainBase(playerEntity), 2);
    MaxResourceCount.set(playerEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);
  }

  function testFailClaimMainBaseLevelObjective() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), 1, 2);
    world.claimObjective(EObjectives.BuildIronMine);
  }

  function testFailClaimInvalidObjective() public {
    world.claimObjective(EObjectives.LENGTH);
  }

  function testFailRequiredClaimObjective() public {
    bytes32[] memory objectives = new bytes32[](1);
    objectives[0] = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    P_RequiredObjectives.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), objectives);
    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjective() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    console.log("claiming objective", uint256(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine))));
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);
    assertEq(
      ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)),
      resourceRewardData.amounts[0],
      "Resource does not match"
    );
  }

  function testClaimObjectiveReceiveResourceRewards() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    ResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 0);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);
    world.claimObjective(EObjectives.BuildIronMine);
    assertEq(
      ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)),
      resourceRewardData.amounts[0],
      "Resource does not match"
    );
  }

  function testFailClaimObjectiveReceiveResourceRewards() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    ResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 0);
    console.log(ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)));
    world.claimObjective(EObjectives.BuildIronMine);
    console.log(ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)));
  }

  function testClaimObjectiveReceiveUnitRewards() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    UnitCount.set(Home.get(playerEntity).asteroid, unit1, 0);
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
    LibProduction.increaseResourceProduction(spaceRockEntity, EResource.U_Housing, 100);

    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);
    assertEq(
      UnitCount.get(Home.get(playerEntity).asteroid, unit1),
      unitRewardData.amounts[0],
      "Unit count does not match"
    );
  }

  function testFailClaimObjectiveReceiveUnitRewards() public {
    UnitCount.set(Home.get(playerEntity).asteroid, unit1, 0);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    P_UnitRewardData memory unitRewardData = P_UnitRewardData(new bytes32[](1), new uint256[](1));
    unitRewardData.units[0] = unit1;
    unitRewardData.amounts[0] = 100;
    P_UnitReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), unitRewardData);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(EResource.U_Housing);
    requiredResourcesData.amounts[0] = 1;
    P_RequiredResources.set(unit1, 0, requiredResourcesData);

    world.claimObjective(EObjectives.BuildIronMine);
  }

  function testFailClaimObjectiveTwice() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)));
    world.claimObjective(EObjectives.BuildIronMine);
    world.claimObjective(EObjectives.BuildIronMine);
  }

  function testClaimObjectiveHasBuiltBuilding() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);
  }

  function testClaimObjectiveHasProducedResources() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    P_ProducedResourcesData memory producedResourcesData = P_ProducedResourcesData(new uint8[](1), new uint256[](1));
    producedResourcesData.resources[0] = uint8(EResource.Iron);
    producedResourcesData.amounts[0] =
      P_Production.getAmounts(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1)[0] *
      10;
    P_ProducedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)),
      producedResourcesData
    );
    MaxResourceCount.set(
      spaceRockEntity,
      uint8(EResource.Iron),
      P_Production.getAmounts(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1)[0] * 100
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    LastClaimedAt.set(spaceRockEntity, block.timestamp - 10);

    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);
    world.claimObjective(EObjectives.BuildCopperMine);

    assertEq(
      ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)),
      producedResourcesData.amounts[0] + 100,
      "Produced Resource does not match"
    );
  }

  function testFailClaimObjectiveHasProducedResources() public {
    world.build(EBuilding.IronMine, getIronPosition(creator));
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    world.claimObjective(EObjectives.BuildIronMine);
    P_ProducedResourcesData memory producedResourcesData = P_ProducedResourcesData(new uint8[](1), new uint256[](1));
    producedResourcesData.resources[0] = uint8(EResource.Iron);
    producedResourcesData.amounts[0] =
      P_Production.getAmounts(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.IronMine)), 1)[0] *
      10;
    P_ProducedResources.set(
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)),
      producedResourcesData
    );
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    LastClaimedAt.set(spaceRockEntity, block.timestamp - 5);
    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjectiveRequiredObjectives() public {
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    bytes32[] memory objectives = new bytes32[](1);
    objectives[0] = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    P_RequiredObjectives.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), objectives);

    CompletedObjective.set(
      addressToEntity(creator),
      P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)),
      true
    );
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjectiveRaidedResources() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);

    P_RaidedResourcesData memory raidedResourcesData = P_RaidedResourcesData(new uint8[](1), new uint256[](1));
    raidedResourcesData.resources[0] = uint8(EResource.Iron);
    raidedResourcesData.amounts[0] = 100;
    P_RaidedResources.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), raidedResourcesData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    setupRaid();
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);

    world.claimObjective(EObjectives.BuildCopperMine);
    assertEq(
      ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)),
      raidedResourcesData.amounts[0] + 100,
      "Produced Resource does not match"
    );
  }

  function testFailClaimObjectiveRaidedResources() public {
    P_RaidedResourcesData memory raidedResourcesData = P_RaidedResourcesData(new uint8[](1), new uint256[](1));
    raidedResourcesData.resources[0] = uint8(EResource.Iron);
    raidedResourcesData.amounts[0] = 100;
    P_RaidedResources.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), raidedResourcesData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjectiveDestroyedUnits() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    P_DestroyedUnitsData memory destroyedUnitsData = P_DestroyedUnitsData(new bytes32[](1), new uint256[](1));
    destroyedUnitsData.units[0] = unit1;
    destroyedUnitsData.amounts[0] = 100;
    P_DestroyedUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), destroyedUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));

    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);

    setupRaid();
    RaidResultData memory raidResult = LibRaid.resolveRaid(br);
    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testFailClaimObjectiveDestroyedUnits() public {
    P_DestroyedUnitsData memory destroyedUnitsData = P_DestroyedUnitsData(new bytes32[](1), new uint256[](1));
    destroyedUnitsData.units[0] = unit1;
    destroyedUnitsData.amounts[0] = 100;
    P_DestroyedUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), destroyedUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));

    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjectiveRequiredUnits() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_RequiredUnitsData memory requiredUnitsData = P_RequiredUnitsData(new bytes32[](1), new uint256[](1));
    requiredUnitsData.units[0] = unit1;
    requiredUnitsData.amounts[0] = 100;
    P_RequiredUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), requiredUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    UnitCount.set(Home.get(playerEntity).asteroid, unit1, 100);

    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);
    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testFailClaimObjectiveRequiredUnits() public {
    P_RequiredUnitsData memory requiredUnitsData = P_RequiredUnitsData(new bytes32[](1), new uint256[](1));
    requiredUnitsData.units[0] = unit1;
    requiredUnitsData.amounts[0] = 100;
    P_RequiredUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), requiredUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));

    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testClaimObjectiveProducedUnits() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ProducedUnitsData memory producedUnitsData = P_ProducedUnitsData(new bytes32[](1), new uint256[](1));
    producedUnitsData.units[0] = unit1;
    producedUnitsData.amounts[0] = 100;
    P_ProducedUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), producedUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));
    ProducedUnit.set(playerEntity, unit1, 100);

    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function testFailClaimObjectiveProducedUnits() public {
    P_ProducedUnitsData memory producedUnitsData = P_ProducedUnitsData(new bytes32[](1), new uint256[](1));
    producedUnitsData.units[0] = unit1;
    producedUnitsData.amounts[0] = 100;
    P_ProducedUnits.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), producedUnitsData);
    P_HasBuiltBuildings.deleteRecord(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)));

    world.claimObjective(EObjectives.BuildCopperMine);
  }

  function setupSpawnPirateAsteroid(
    bytes32 objectivePrototype,
    int32 x,
    int32 y,
    uint256 unit1Count,
    uint256 ironCount
  ) internal returns (P_SpawnPirateAsteroidData memory spawnPirateAsteroid) {
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit1;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
    P_HasBuiltBuildings.deleteRecord(objectivePrototype);

    spawnPirateAsteroid.x = x;
    spawnPirateAsteroid.y = y;
    spawnPirateAsteroid.resources = new uint8[](1);
    spawnPirateAsteroid.resources[0] = uint8(EResource.Iron);
    spawnPirateAsteroid.resourceAmounts = new uint256[](1);
    spawnPirateAsteroid.resourceAmounts[0] = ironCount;
    spawnPirateAsteroid.units = new bytes32[](1);
    spawnPirateAsteroid.units[0] = unit1;
    spawnPirateAsteroid.unitAmounts = new uint256[](1);
    spawnPirateAsteroid.unitAmounts[0] = unit1Count;

    P_SpawnPirateAsteroid.set(objectivePrototype, spawnPirateAsteroid);
  }

  function setupSpawnPirateAsteroid(bytes32 objectivePrototype)
    internal
    returns (P_SpawnPirateAsteroidData memory spawnPirateAsteroid)
  {
    spawnPirateAsteroid = setupSpawnPirateAsteroid(objectivePrototype, 10, -10, 10, 100);
  }

  function testClaimObjectiveSpawnPirateAsteroid() public {
    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    P_SpawnPirateAsteroidData memory spawnPirateAsteroid = setupSpawnPirateAsteroid(objectivePrototype);
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);
    console.log("pirate asteroid spawned");

    bytes32 personalPirateEntity = LibEncode.getHash(PirateKey, playerEntity);
    bytes32 pirateAsteroidEntity = LibEncode.getHash(personalPirateEntity);

    assertEq(
      Position.get(pirateAsteroidEntity).x,
      Position.get(Home.get(playerEntity).asteroid).x + spawnPirateAsteroid.x,
      "X position does not match"
    );
    assertEq(
      Position.get(pirateAsteroidEntity).y,
      Position.get(Home.get(playerEntity).asteroid).y + spawnPirateAsteroid.y,
      "Y position does not match"
    );

    assertEq(
      ResourceCount.get(pirateAsteroidEntity, uint8(EResource.Iron)),
      spawnPirateAsteroid.resourceAmounts[0],
      "Resource count does not match"
    );
    assertEq(
      UnitCount.get(pirateAsteroidEntity, unit1),
      spawnPirateAsteroid.unitAmounts[0],
      "Unit count does not match"
    );
    assertEq(PirateAsteroid.get(pirateAsteroidEntity).playerEntity, playerEntity, "Player entity does not match");
    assertEq(PirateAsteroid.get(pirateAsteroidEntity).prototype, objectivePrototype, "Prototype does not match");

    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    ResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 0);

    br = BattleResultData({
      attacker: playerEntity,
      defender: personalPirateEntity,
      winner: playerEntity,
      rock: pirateAsteroidEntity,
      totalCargo: 100,
      timestamp: block.timestamp,
      attackerStartingUnits: getUnitArray(100, 50),
      defenderStartingUnits: getUnitArray(100, 10),
      attackerUnitsLeft: getUnitArray(50, 20),
      defenderUnitsLeft: getUnitArray(0, 0)
    });

    // setup utility for player
    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResources.get(unit1, Level.get(playerEntity));
    for (uint8 i = 0; i < requiredResourcesData.resources.length; i++) {
      if (P_IsUtility.get(requiredResourcesData.resources[i])) {
        LibProduction.increaseResourceProduction(
          spaceRockEntity,
          EResource(requiredResourcesData.resources[i]),
          requiredResourcesData.amounts[i] * 100
        );
        console.log("utility for unit1 provided");
        console.log(requiredResourcesData.amounts[i] * 100);
      }
      LibUnit.updateStoredUtilities(spaceRockEntity, unit1, requiredResourcesData.amounts[i] * 100, true);
    }
    console.log("utility for unit1 provided");
    requiredResourcesData = P_RequiredResources.get(unit2, Level.get(playerEntity));
    for (uint8 i = 0; i < requiredResourcesData.resources.length; i++) {
      if (P_IsUtility.get(requiredResourcesData.resources[i])) {
        LibProduction.increaseResourceProduction(
          spaceRockEntity,
          EResource(requiredResourcesData.resources[i]),
          requiredResourcesData.amounts[i] * 50
        );
        LibUnit.updateStoredUtilities(spaceRockEntity, unit2, requiredResourcesData.amounts[i] * 50, true);
        console.log("utility for unit2 provided");
        console.log(requiredResourcesData.amounts[i] * 50);
      }
    }
    console.log("utility for unit2 provided");

    LibRaid.resolveRaid(br);

    console.log("raid resolved");

    assertEq(ResourceCount.get(pirateAsteroidEntity, uint8(EResource.Iron)), 0, "Resource count does not match");
    assertEq(UnitCount.get(pirateAsteroidEntity, unit1), 0, "Unit count does not match");
    assertEq(UnitCount.get(pirateAsteroidEntity, unit2), 0, "Unit count does not match");

    assertEq(
      ResourceCount.get(spaceRockEntity, uint8(EResource.Iron)),
      spawnPirateAsteroid.resourceAmounts[0],
      "Resource count does not match"
    );
    assertEq(DefeatedPirate.get(playerEntity, objectivePrototype), true, "Pirate not defeated");
  }

  function tesFailCannotAttackOtherPlayerPirateAsteroid() public {
    UnitCount.set(Home.get(playerEntity).asteroid, unit1, 100);
    UnitCount.set(Home.get(playerEntity).asteroid, unit2, 50);
    LibProduction.increaseResourceProduction(playerEntity, EResource.U_MaxMoves, 100);

    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    setupSpawnPirateAsteroid(objectivePrototype);
    vm.stopPrank();
    spawn(alice);

    vm.startPrank(alice);

    world.claimObjective(EObjectives.BuildIronMine);

    bytes32 personalPirateEntity = LibEncode.getHash(PirateKey, addressToEntity(alice));
    bytes32 pirateAsteroidEntity = LibEncode.getHash(personalPirateEntity);

    vm.startPrank(creator);
    uint256[NUM_UNITS] memory unitCounts;
    unitCounts[0] = 100;
    unitCounts[1] = 50;

    world.sendUnits(
      unitCounts,
      ESendType.Raid,
      Position.get(Home.get(playerEntity).asteroid),
      Position.get(pirateAsteroidEntity),
      personalPirateEntity
    );
  }

  function testSendUnitsPirateAsteroid() public {
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    UnitCount.set(Home.get(playerEntity).asteroid, unit1, 100);
    UnitCount.set(Home.get(playerEntity).asteroid, unit2, 50);
    LibProduction.increaseResourceProduction(spaceRockEntity, EResource.U_MaxMoves, 100);

    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    setupSpawnPirateAsteroid(objectivePrototype);

    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 100);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);

    bytes32 personalPirateEntity = LibEncode.getHash(PirateKey, playerEntity);
    bytes32 pirateAsteroidEntity = LibEncode.getHash(personalPirateEntity);

    uint256[NUM_UNITS] memory unitCounts;
    unitCounts[0] = 100;
    unitCounts[1] = 50;

    P_Unit.setSpeed(unit1, 0, 100);
    P_Unit.setSpeed(unit2, 0, 100);
    world.sendUnits(
      unitCounts,
      ESendType.Raid,
      Position.get(Home.get(playerEntity).asteroid),
      Position.get(pirateAsteroidEntity),
      personalPirateEntity
    );
  }

  function testSecondPirateAsteroid() public {
    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine));
    setupSpawnPirateAsteroid(objectivePrototype);
    bytes32 spaceRockEntity = Home.getAsteroid(playerEntity);
    MaxResourceCount.set(spaceRockEntity, uint8(EResource.Iron), 200);
    P_ResourceRewardData memory resourceRewardData = P_ResourceRewardData(new uint8[](1), new uint256[](1));
    resourceRewardData.resources[0] = uint8(EResource.Iron);
    resourceRewardData.amounts[0] = 100;
    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildIronMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildIronMine);

    bytes32 personalPirateEntity = LibEncode.getHash(PirateKey, playerEntity);
    bytes32 pirateAsteroidEntity = LibEncode.getHash(personalPirateEntity);

    PositionData memory pirateAsteroidPosition = Position.get(pirateAsteroidEntity);

    objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine));
    setupSpawnPirateAsteroid(objectivePrototype, 100, 100, 10, 300);

    P_ResourceReward.set(P_EnumToPrototype.get(ObjectiveKey, uint8(EObjectives.BuildCopperMine)), resourceRewardData);

    world.claimObjective(EObjectives.BuildCopperMine);
    assertEq(
      ReversePosition.get(pirateAsteroidPosition.x, pirateAsteroidPosition.y) != pirateAsteroidEntity,
      true,
      "Pirate asteroid not moved"
    );
    assertTrue(Position.get(pirateAsteroidEntity).x != pirateAsteroidPosition.x, "Pirate asteroid not moved");
    assertEq(ResourceCount.get(pirateAsteroidEntity, uint8(Iron)), 400, "Resource count does not match");
    assertEq(UnitCount.get(pirateAsteroidEntity, unit1), 10, "Unit count does not match");
  }
}
