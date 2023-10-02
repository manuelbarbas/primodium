// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { SendUnitsSystem, ID as SendUnitsSystemID } from "systems/SendUnitsSystem.sol";
import { TrainUnitsSystem, ID as TrainUnitsSystemID } from "systems/TrainUnitsSystem.sol";
import { BuildSystem, ID as BuildSystemID } from "systems/BuildSystem.sol";
import { InvadeSystem, ID as InvadeSystemID } from "systems/InvadeSystem.sol";
import { RaidSystem, ID as RaidSystemID } from "systems/RaidSystem.sol";
import { ReceiveReinforcementSystem, ID as ReceiveReinforcementSystemID } from "systems/ReceiveReinforcementSystem.sol";
import { RecallReinforcementsSystem, ID as RecallReinforcementsSystemID } from "systems/RecallReinforcementsSystem.sol";
import { RecallUnitsFromMotherlodeSystem, ID as RecallUnitsFromMotherlodeSystemID } from "systems/RecallUnitsFromMotherlodeSystem.sol";
import { ClaimObjectiveSystem, ID as ClaimObjectiveSystemID } from "systems/ClaimObjectiveSystem.sol";
import { UpgradeBuildingSystem, ID as UpgradeBuildingSystemID } from "systems/UpgradeBuildingSystem.sol";
import { ResearchSystem, ID as ResearchSystemID } from "systems/ResearchSystem.sol";
//components
import { P_RequiredPirateAsteroidDefeatedComponent, ID as P_RequiredPirateAsteroidDefeatedComponentID } from "components/P_RequiredPirateAsteroidDefeatedComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "components/P_MaxStorageComponent.sol";
import { P_UnitRewardComponent, ID as P_UnitRewardComponentID } from "components/P_UnitRewardComponent.sol";
import { P_ResourceRewardComponent, ID as P_ResourceRewardComponentID } from "components/P_ResourceRewardComponent.sol";
import { MotherlodeComponent, ID as MotherlodeComponentID } from "components/MotherlodeComponent.sol";
import { P_HasBuiltBuildingComponent, ID as P_HasBuiltBuildingComponentID } from "components/P_HasBuiltBuildingComponent.sol";
import { P_BuildingCountRequirementComponent, ID as P_BuildingCountRequirementComponentID } from "components/P_BuildingCountRequirementComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { P_ObjectiveRequirementComponent, ID as P_ObjectiveRequirementComponentID } from "components/P_ObjectiveRequirementComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitRequirementComponent, ID as P_UnitRequirementComponentID } from "components/P_UnitRequirementComponent.sol";
import { HasCompletedObjectiveComponent, ID as HasCompletedObjectiveComponentID } from "components/HasCompletedObjectiveComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { P_UnitTravelSpeedComponent, ID as P_UnitTravelSpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_IsUnitComponent, ID as P_IsUnitComponentID } from "components/P_IsUnitComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID, SingletonID } from "components/GameConfigComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { UnitsComponent, ID as UnitsComponentID } from "components/UnitsComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { PirateComponent, ID as PirateComponentID } from "components/PirateComponent.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibSend } from "libraries/LibSend.sol";
import { LibArrival } from "libraries/LibArrival.sol";
import { LibMotherlode } from "libraries/LibMotherlode.sol";
import { LibUtilityResource } from "libraries/LibUtilityResource.sol";
import { LibPirateAsteroid } from "libraries/LibPirateAsteroid.sol";
import { ArrivalsList } from "libraries/ArrivalsList.sol";

contract ClaimObjectiveSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  PositionComponent public positionComponent;
  P_IsUnitComponent public isUnitComponent;
  GameConfigComponent public gameConfigComponent;
  OwnedByComponent public ownedByComponent;
  UnitsComponent public unitsComponent;
  OccupiedUtilityResourceComponent public occupiedUtilityResourceComponent;
  HasCompletedObjectiveComponent public hasCompletedObjectiveComponent;
  ItemComponent public itemComponent;

  ComponentDevSystem public componentDevSystem;
  ClaimObjectiveSystem public claimObjectiveSystem;
  SendUnitsSystem public sendUnitsSystem;
  TrainUnitsSystem public trainUnitsSystem;
  BuildSystem public buildSystem;
  InvadeSystem public invadeSystem;
  RaidSystem public raidSystem;
  ReceiveReinforcementSystem public receiveReinforcementSystem;
  RecallReinforcementsSystem public recallReinforcementsSystem;
  RecallUnitsFromMotherlodeSystem public recallUnitsFromMotherlodeSystem;
  UpgradeBuildingSystem public upgradeBuildingSystem;
  ResearchSystem public researchSystem;

  function setUp() public override {
    super.setUp();
    itemComponent = ItemComponent(component(ItemComponentID));
    positionComponent = PositionComponent(component(PositionComponentID));
    raidSystem = RaidSystem(system(RaidSystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    sendUnitsSystem = SendUnitsSystem(system(SendUnitsSystemID));
    buildSystem = BuildSystem(system(BuildSystemID));
    trainUnitsSystem = TrainUnitsSystem(system(TrainUnitsSystemID));
    invadeSystem = InvadeSystem(system(InvadeSystemID));
    claimObjectiveSystem = ClaimObjectiveSystem(system(ClaimObjectiveSystemID));
    receiveReinforcementSystem = ReceiveReinforcementSystem(system(ReceiveReinforcementSystemID));
    recallReinforcementsSystem = RecallReinforcementsSystem(system(RecallReinforcementsSystemID));
    recallUnitsFromMotherlodeSystem = RecallUnitsFromMotherlodeSystem(system(RecallUnitsFromMotherlodeSystemID));
    upgradeBuildingSystem = UpgradeBuildingSystem(system(UpgradeBuildingSystemID));
    researchSystem = ResearchSystem(system(ResearchSystemID));
    occupiedUtilityResourceComponent = OccupiedUtilityResourceComponent(
      world.getComponent(OccupiedUtilityResourceComponentID)
    );
    unitsComponent = UnitsComponent(world.getComponent(UnitsComponentID));
    isUnitComponent = P_IsUnitComponent(world.getComponent(P_IsUnitComponentID));
    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    hasCompletedObjectiveComponent = HasCompletedObjectiveComponent(
      world.getComponent(HasCompletedObjectiveComponentID)
    );
    spawn(alice);
    spawn(bob);
    spawn(deployer);

    gameConfigComponent = GameConfigComponent(world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = GameConfig({
      moveSpeed: 100,
      motherlodeDistance: 10,
      maxMotherlodesPerAsteroid: 6,
      motherlodeChanceInv: 6
    });
    vm.prank(deployer);
    gameConfigComponent.set(SingletonID, gameConfig);

    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(alice), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(bob), abi.encode(100));
    componentDevSystem.executeTyped(MaxMovesComponentID, addressToEntity(deployer), abi.encode(100));
  }

  function testSpawnPirateAsteroidObjective() public {
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugSpawnPirateAsteroidObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    claimObjectiveSystem.executeTyped(DebugSpawnPirateAsteroidObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugSpawnPirateAsteroidObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
    uint256 personalPirateEntity = LibPirateAsteroid.getPersonalPirate(addressToEntity(alice));
    uint256 asteroidEntity = LibUpdateSpaceRock.getPlayerAsteroidEntity(world, personalPirateEntity);
    assertTrue(PirateComponent(world.getComponent(PirateComponentID)).has(asteroidEntity), "pirate asteroid not found");
    assertTrue(
      PirateComponent(world.getComponent(PirateComponentID)).has(personalPirateEntity),
      "personal pirate not found"
    );
    assertEq(
      LibUnits.getUnitCountOnRock(world, personalPirateEntity, asteroidEntity, DebugUnit),
      5,
      "there must be 5 DebugUnit on asteroid"
    );
    assertEq(
      LibMath.getSafe(
        ItemComponent(world.getComponent(ItemComponentID)),
        LibEncode.hashKeyEntity(IronResourceItemID, personalPirateEntity)
      ),
      100,
      "there must be 100 iron on asteroid"
    );
    vm.stopPrank();
    setupUnits(alice, DebugUnit, 10);
    vm.startPrank(alice);
    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? 10 : 0);
    }
    console.log("alice: %s", addressToEntity(alice));

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.RAID,
      getHomeAsteroid(alice),
      positionComponent.getValue(asteroidEntity),
      personalPirateEntity
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));
    vm.roll(block.number + 200);

    raidSystem.executeTyped(arrival.destination);

    assertEq(
      LibUnits.getUnitCountOnRock(world, personalPirateEntity, asteroidEntity, DebugUnit),
      0,
      "there must be 0 DebugUnit on asteroid"
    );
    assertEq(
      LibMath.getSafe(
        ItemComponent(world.getComponent(ItemComponentID)),
        LibEncode.hashKeyEntity(IronResourceItemID, personalPirateEntity)
      ),
      0,
      "there must be 0 on asteroid"
    );

    claimObjectiveSystem.executeTyped(DebugDefeatedPirateAsteroidObjectiveID);

    vm.stopPrank();
  }

  function testFailClaimObjectiveDefeatedPirateAsteroid() public {
    P_RequiredPirateAsteroidDefeatedComponent requiredPirateAsteroidDefeatedComponent = P_RequiredPirateAsteroidDefeatedComponent(
        world.getComponent(P_RequiredPirateAsteroidDefeatedComponentID)
      );
    assertTrue(
      requiredPirateAsteroidDefeatedComponent.has(DebugDefeatedPirateAsteroidObjectiveID),
      "objective should have defeated pirate asteroid requirement"
    );
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugDefeatedPirateAsteroidObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    claimObjectiveSystem.executeTyped(DebugDefeatedPirateAsteroidObjectiveID);

    vm.stopPrank();
  }

  function testFailSpawnPirateAsteroidObjective() public {
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugSpawnPirateAsteroidObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    claimObjectiveSystem.executeTyped(DebugSpawnPirateAsteroidObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugSpawnPirateAsteroidObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
    uint256 personalPirateEntity = LibPirateAsteroid.getPersonalPirate(addressToEntity(alice));
    uint256 asteroidEntity = LibUpdateSpaceRock.getPlayerAsteroidEntity(world, personalPirateEntity);
    assertTrue(PirateComponent(world.getComponent(PirateComponentID)).has(asteroidEntity), "pirate asteroid not found");
    assertTrue(
      PirateComponent(world.getComponent(PirateComponentID)).has(personalPirateEntity),
      "personal pirate not found"
    );
    assertEq(
      LibUnits.getUnitCountOnRock(world, personalPirateEntity, asteroidEntity, DebugUnit),
      5,
      "there must be 5 DebugUnit on asteroid"
    );
    assertEq(
      LibMath.getSafe(
        ItemComponent(world.getComponent(ItemComponentID)),
        LibEncode.hashKeyEntity(IronResourceItemID, personalPirateEntity)
      ),
      100,
      "there must be 100 iron on asteroid"
    );
    vm.stopPrank();
    setupUnits(bob, DebugUnit, 10);
    vm.startPrank(bob);
    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? 10 : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.RAID,
      getHomeAsteroid(bob),
      positionComponent.getValue(asteroidEntity),
      personalPirateEntity
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));
    vm.roll(block.number + 200);

    raidSystem.executeTyped(arrival.destination);

    vm.stopPrank();
  }

  function testFailClaimObjectiveNotRegistered() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugUnit, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugUnit);
  }

  function testFailClaimObjectiveTwice() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
  }

  function testClaimObjective() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugFreeObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveHasUnits() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_UnitRequirementComponent(world.getComponent(P_UnitRequirementComponentID))
      .getValue(DebugHaveUnitsObjectiveID);

    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      setupUnits(alice, resourceValues.resources[i], resourceValues.values[i]);
    }

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveUnitsObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveHasUnits() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHaveUnitsObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    ).getValue(DebugHaveUnitsObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "no resources required for objective");

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveUnitsObjectiveID);
  }

  function testClaimObjectiveResources() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    ).getValue(DebugHavResourcesObjectiveID);

    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      vm.prank(alice);
      componentDevSystem.executeTyped(
        ItemComponentID,
        LibEncode.hashKeyEntity(resourceValues.resources[i], addressToEntity(alice)),
        abi.encode(resourceValues.values[i])
      );
    }
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHavResourcesObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveResources() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHavResourcesObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHavResourcesObjectiveID);
  }

  function testClaimObjectiveMaxUtility() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHaveMaxUtilityObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );

    ResourceValues memory resourceValues = requiredUtilityComponent.getValue(DebugHaveMaxUtilityObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "no utility resources required for objective");

    vm.prank(alice);
    buildSystem.executeTyped(DebugSolarPanelID, getCoord2(alice));
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveMaxUtilityObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHaveMaxUtilityObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveMaxUtility() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugHaveMaxUtilityObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );

    ResourceValues memory resourceValues = requiredUtilityComponent.getValue(DebugHaveMaxUtilityObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "no resources required for objective");

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugHaveMaxUtilityObjectiveID);
  }

  function testClaimObjectiveRequiresObjective() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugCompletedPriorObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    P_ObjectiveRequirementComponent objectiveRequirementComponent = P_ObjectiveRequirementComponent(
      world.getComponent(P_ObjectiveRequirementComponentID)
    );
    assertTrue(
      objectiveRequirementComponent.has(DebugCompletedPriorObjectiveID),
      "no prior objective required for objective"
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugFreeObjectiveID);
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugCompletedPriorObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugCompletedPriorObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveRequiredObjective() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugCompletedPriorObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_ObjectiveRequirementComponent objectiveRequirementComponent = P_ObjectiveRequirementComponent(
      world.getComponent(P_ObjectiveRequirementComponentID)
    );
    assertTrue(
      objectiveRequirementComponent.has(DebugCompletedPriorObjectiveID),
      "no prior objective required for objective"
    );

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugCompletedPriorObjectiveID);
  }

  function testClaimObjectiveMainBaseLevel() public {
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugMainBaseLevelObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    assertTrue(levelComponent.has(DebugMainBaseLevelObjectiveID), "no Main Base level is required for objective");
    componentDevSystem.executeTyped(
      P_RequiredResourcesComponentID,
      LibEncode.hashKeyEntity(MainBaseID, 2),
      abi.encode()
    );
    upgradeBuildingSystem.executeTyped(getMainBaseCoord(alice));
    claimObjectiveSystem.executeTyped(DebugMainBaseLevelObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugMainBaseLevelObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
    vm.stopPrank();
  }

  function testFailClaimObjectiveMainBaseLevel() public {
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugMainBaseLevelObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    assertTrue(levelComponent.has(DebugMainBaseLevelObjectiveID), "no prior objective required for objective");

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugMainBaseLevelObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugMainBaseLevelObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveTechnologyRequirement() public {
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugTechnologyResearchedObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      world.getComponent(P_RequiredResearchComponentID)
    );
    assertTrue(
      requiredResearchComponent.has(DebugTechnologyResearchedObjectiveID),
      "no Technologye is required for objective"
    );
    researchSystem.executeTyped(DebugSimpleTechnologyNoReqsID);

    claimObjectiveSystem.executeTyped(DebugTechnologyResearchedObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugTechnologyResearchedObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
    vm.stopPrank();
  }

  function testFailClaimObjectiveTechnologyRequirement() public {
    vm.startPrank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugTechnologyResearchedObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      world.getComponent(P_RequiredResearchComponentID)
    );
    assertTrue(
      requiredResearchComponent.has(DebugTechnologyResearchedObjectiveID),
      "no Technologye is required for objective"
    );

    claimObjectiveSystem.executeTyped(DebugTechnologyResearchedObjectiveID);
    vm.stopPrank();
  }

  function testClaimObjectiveResourceProduction() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceProductionObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    ).getValue(DebugResourceProductionObjectiveID);

    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      vm.prank(alice);
      componentDevSystem.executeTyped(
        ProductionComponentID,
        LibEncode.hashKeyEntity(resourceValues.resources[i], addressToEntity(alice)),
        abi.encode(resourceValues.values[i])
      );
    }
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugResourceProductionObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceProductionObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveResourceProduction() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceProductionObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_ProductionDependenciesComponent(
      world.getComponent(P_ProductionDependenciesComponentID)
    ).getValue(DebugResourceProductionObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "no resource production required for objective");
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugResourceProductionObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceProductionObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveBuildingCount() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugNumberOfBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    P_BuildingCountRequirementComponent buildingCountRequirementComponent = P_BuildingCountRequirementComponent(
      world.getComponent(P_BuildingCountRequirementComponentID)
    );
    assertTrue(
      buildingCountRequirementComponent.has(DebugNumberOfBuiltBuildingTypeObjectiveID),
      "no building required for objective"
    );
    vm.prank(alice);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, getCoord2(alice));
    vm.prank(alice);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, getCoord3(alice));

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugNumberOfBuiltBuildingTypeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugNumberOfBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveBuildingCount() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugNumberOfBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );

    P_BuildingCountRequirementComponent buildingCountRequirementComponent = P_BuildingCountRequirementComponent(
      world.getComponent(P_BuildingCountRequirementComponentID)
    );
    assertTrue(
      buildingCountRequirementComponent.has(DebugNumberOfBuiltBuildingTypeObjectiveID),
      "no building required for objective"
    );

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugNumberOfBuiltBuildingTypeObjectiveID);
  }

  function testClaimObjectiveHasBuiltBuilding() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_HasBuiltBuildingComponent hasBuiltBuildingComponent = P_HasBuiltBuildingComponent(
      world.getComponent(P_HasBuiltBuildingComponentID)
    );
    assertTrue(hasBuiltBuildingComponent.has(DebugBuiltBuildingTypeObjectiveID), "no building required for objective");
    vm.prank(alice);
    buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, getCoord2(alice));

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugBuiltBuildingTypeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveHasBuiltBuilding() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    P_HasBuiltBuildingComponent hasBuiltBuildingComponent = P_HasBuiltBuildingComponent(
      world.getComponent(P_HasBuiltBuildingComponentID)
    );
    assertTrue(hasBuiltBuildingComponent.has(DebugBuiltBuildingTypeObjectiveID), "no building required for objective");

    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugBuiltBuildingTypeObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugBuiltBuildingTypeObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveResourceReward() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceRewardObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID))
      .getValue(DebugResourceRewardObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "objective should have resource rewards");
    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      vm.prank(alice);
      componentDevSystem.executeTyped(
        P_MaxStorageComponentID,
        LibEncode.hashKeyEntity(resourceValues.resources[i], addressToEntity(alice)),
        abi.encode(resourceValues.values[i])
      );
    }
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugResourceRewardObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceRewardObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      vm.prank(alice);
      assertEq(
        LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(resourceValues.resources[i], addressToEntity(alice))),
        resourceValues.values[i],
        "alice should have received resource reward"
      );
    }
  }

  function testFailClaimObjectiveResourceReward() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugResourceRewardObjectiveID, addressToEntity(alice))
      ),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_ResourceRewardComponent(world.getComponent(P_ResourceRewardComponentID))
      .getValue(DebugResourceRewardObjectiveID);
    assertTrue(resourceValues.resources.length > 0, "objective should have resource rewards");
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugResourceRewardObjectiveID);
  }

  function testClaimObjectiveUnitReward() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugUnitsRewardObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).getValue(
      DebugUnitsRewardObjectiveID
    );
    assertTrue(resourceValues.resources.length > 0, "objective should have unit rewards");
    componentDevSystem.executeTyped(
      MaxUtilityComponentID,
      LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice)),
      abi.encode(100)
    );
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugUnitsRewardObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugUnitsRewardObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
    for (uint256 i = 0; i < resourceValues.resources.length; i++) {
      assertEq(
        LibUnits.getUnitCountOnRock(
          world,
          addressToEntity(alice),
          getHomeAsteroidEntity(alice),
          resourceValues.resources[i]
        ),
        resourceValues.values[i],
        "alice should have unit reward"
      );
    }
  }

  function testFailClaimObjectiveUnitReward() public {
    vm.prank(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugUnitsRewardObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    ResourceValues memory resourceValues = P_UnitRewardComponent(world.getComponent(P_UnitRewardComponentID)).getValue(
      DebugUnitsRewardObjectiveID
    );

    console.log(
      LibMath.getSafe(
        occupiedUtilityResourceComponent,
        LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice))
      )
    );
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(world.getComponent(MaxUtilityComponentID));
    console.log(
      LibMath.getSafe(maxUtilityComponent, LibEncode.hashKeyEntity(HousingUtilityResourceID, addressToEntity(alice)))
    );
    assertTrue(resourceValues.resources.length > 0, "objective should have unit rewards");
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugUnitsRewardObjectiveID);
  }

  // todo: check motherlode movement rules

  function setupUnits(
    address playerAddress,
    uint256 unitType,
    uint32 count
  ) internal {
    vm.startPrank(playerAddress);
    vm.roll(0);
    bytes memory unitProductionBuildingEntity = buildSystem.executeTyped(
      DebugUnitProductionBuilding,
      getIronCoord(playerAddress)
    );
    uint256 unitProductionBuildingEntityID = abi.decode(unitProductionBuildingEntity, (uint256));
    buildSystem.executeTyped(DebugHousingBuilding, getCoord3(playerAddress));

    vm.roll(block.number + 10);
    trainUnitsSystem.executeTyped(unitProductionBuildingEntityID, unitType, count);
    vm.roll(block.number + 20);
    vm.stopPrank();
  }

  function testInvade() public {
    invade(alice, false);
  }

  function calculateArrivalBlock(
    address from,
    address to,
    Arrival memory arrival
  ) public view returns (uint256) {
    //TODO can modify to use the actual speed of the slowest unit
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(from), DebugUnit);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(DebugUnit, playerUnitTypeLevel);
    uint32 speed = P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(
      unitTypeLevelEntity
    );
    Coord memory originPosition = getHomeAsteroid(from);
    Coord memory destinationPosition = getHomeAsteroid(to);
    uint256 worldSpeed = GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * worldSpeed) / 100 / 100);
    return expectedArrivalBlock;
  }

  function findMotherlode(address player) public returns (uint256) {
    GameConfig memory config = gameConfigComponent.getValue(SingletonID);

    vm.startPrank(deployer);
    uint256 asteroid = getHomeAsteroidEntity(player);
    Coord memory sourcePosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(asteroid);
    Coord memory targetPositionRelative = LibMotherlode.getCoord(
      0,
      config.motherlodeDistance,
      config.motherlodeChanceInv
    );
    Coord memory targetPosition = Coord(
      sourcePosition.x + targetPositionRelative.x,
      sourcePosition.y + targetPositionRelative.y,
      0
    );
    uint256 motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
    uint32 i = 0;
    bool found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
    while (i < 6 && !found) {
      i++;
      targetPositionRelative = LibMotherlode.getCoord(i, config.motherlodeDistance, config.motherlodeChanceInv);
      targetPosition = Coord(
        sourcePosition.x + targetPositionRelative.x,
        sourcePosition.y + targetPositionRelative.y,
        0
      );
      motherlodeSeed = uint256(keccak256(abi.encode(asteroid, "motherlode", targetPosition)));
      found = LibMotherlode.isMotherlode(motherlodeSeed, config.motherlodeChanceInv);
    }
    require(found, "uh oh, no motherlode found");
    LibMotherlode.initMotherlode(world, targetPosition, asteroid);
    vm.stopPrank();
    return (asteroid);
  }

  function invade(address invader, bool isNeutral) public returns (Arrival memory) {
    uint256 motherlodeEntity = findMotherlode(bob);

    if (!isNeutral) {
      vm.startPrank(deployer);
      ownedByComponent.set(motherlodeEntity, addressToEntity(bob));
      vm.stopPrank();
    }
    setupUnits(invader, DebugUnit, 10);
    vm.startPrank(invader);
    uint32 attackNumber = 4;
    vm.roll(100);

    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? attackNumber : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.INVADE,
      getHomeAsteroid(alice),
      positionComponent.getValue(motherlodeEntity),
      addressToEntity(bob)
    );

    Arrival memory arrival = abi.decode(rawArrival, (Arrival));

    uint256 speed = getPlayerUnitSpeed(world, invader, DebugUnit) *
      GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    Coord memory originPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(alice)
    );
    Coord memory destinationPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      motherlodeEntity
    );
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed) / 100 / 100);
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.INVADE,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(alice),
      to: addressToEntity(bob),
      origin: getHomeAsteroidEntity(alice),
      destination: motherlodeEntity,
      timestamp: block.number
    });
    assertEq(arrival, expectedArrival);

    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), motherlodeEntity)), 1);
    vm.stopPrank();
    return arrival;
  }

  function getPlayerUnitSpeed(
    IWorld world,
    address player,
    uint256 unitType
  ) public view returns (uint32) {
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(player), unitType);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(unitType, playerUnitTypeLevel);
    return P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(unitTypeLevelEntity);
  }

  function raid(address raider) public returns (Arrival memory) {
    vm.startPrank(bob);
    componentDevSystem.executeTyped(
      ItemComponentID,
      LibEncode.hashKeyEntity(IronID, addressToEntity(bob)),
      abi.encode(1000)
    );
    vm.stopPrank();

    setupUnits(raider, DebugUnit, 10);
    vm.startPrank(raider);
    uint32 attackNumber = 4;
    vm.roll(100);

    uint256[] memory unitTypes = isUnitComponent.getEntities();
    ArrivalUnit[] memory units = new ArrivalUnit[](unitTypes.length);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      units[i] = ArrivalUnit(unitTypes[i], unitTypes[i] == DebugUnit ? attackNumber : 0);
    }

    bytes memory rawArrival = sendUnitsSystem.executeTyped(
      units,
      ESendType.RAID,
      getHomeAsteroid(alice),
      getHomeAsteroid(bob),
      addressToEntity(bob)
    );
    Arrival memory arrival = abi.decode(rawArrival, (Arrival));
    uint256 playerUnitTypeLevel = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(raider), DebugUnit);
    uint256 unitTypeLevelEntity = LibEncode.hashKeyEntity(DebugUnit, playerUnitTypeLevel);
    uint32 speed = P_UnitTravelSpeedComponent(world.getComponent(P_UnitTravelSpeedComponentID)).getValue(
      unitTypeLevelEntity
    );
    Coord memory originPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(alice)
    );
    Coord memory destinationPosition = PositionComponent(world.getComponent(PositionComponentID)).getValue(
      getHomeAsteroidEntity(bob)
    );

    uint256 worldSpeed = GameConfigComponent(world.getComponent(GameConfigComponentID)).getValue(SingletonID).moveSpeed;
    uint256 expectedArrivalBlock = block.number +
      ((LibSend.distance(originPosition, destinationPosition) * speed * worldSpeed) / 100 / 100);
    uint256 origin = positionComponent.getValue(addressToEntity(alice)).parent;
    uint256 destination = positionComponent.getValue(addressToEntity(bob)).parent;
    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.RAID,
      units: units,
      arrivalBlock: expectedArrivalBlock,
      from: addressToEntity(alice),
      to: addressToEntity(bob),
      origin: origin,
      destination: destination,
      timestamp: block.number
    });
    assertEq(arrival, expectedArrival);

    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), getHomeAsteroidEntity(bob))),
      1
    );
    vm.stopPrank();
    return arrival;
  }

  function testClaimObjectiveRaid() public {
    Arrival memory raidArival = raid(alice);
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugRaidObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.roll(block.number + raidArival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    console.log(
      "alice iron: %s",
      LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(alice)))
    );
    vm.prank(alice);
    raidSystem.executeTyped(raidArival.destination);
    console.log(
      "alice iron after raid: %s",
      LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(alice)))
    );
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), raidArival.destination)), 0);
    assertEq(ownedByComponent.getValue(raidArival.destination), addressToEntity(bob));
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugRaidObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugRaidObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveDestroyedUnits() public {
    Arrival memory raidArival = raid(alice);
    setupUnits(bob, DebugUnit, 1);

    console.log(
      "bob unit count %s",
      LibUnits.getUnitCountOnRock(
        world,
        addressToEntity(bob),
        LibUpdateSpaceRock.getPlayerAsteroidEntity(world, addressToEntity(bob)),
        DebugUnit
      )
    );
    assertTrue(
      !hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugRaidObjectiveID, addressToEntity(alice))),
      "objective should not have been completed"
    );
    vm.roll(block.number + raidArival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    console.log(
      "alice iron: %s",
      LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(alice)))
    );
    vm.prank(alice);
    raidSystem.executeTyped(raidArival.destination);
    console.log(
      "alice iron after raid: %s",
      LibMath.getSafe(itemComponent, LibEncode.hashKeyEntity(IronResourceItemID, addressToEntity(alice)))
    );
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), raidArival.destination)), 0);
    assertEq(ownedByComponent.getValue(raidArival.destination), addressToEntity(bob));
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugDestroyedUnitsObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(DebugDestroyedUnitsObjectiveID, addressToEntity(alice))
      ),
      "objective should have been completed"
    );
  }

  function testFailClaimObjectiveRaid() public {
    vm.prank(alice);
    claimObjectiveSystem.executeTyped(DebugRaidObjectiveID);
    assertTrue(
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(DebugRaidObjectiveID, addressToEntity(alice))),
      "objective should have been completed"
    );
  }

  function testClaimObjectiveMotherlodeMining() public {
    Arrival memory invasionArrival = invade(alice, true);

    vm.roll(invasionArrival.arrivalBlock);
    uint32 currMoves = ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice));
    vm.prank(alice);
    invadeSystem.executeTyped(invasionArrival.destination);
    assertEq(ArrivalsSizeComponent(component(ArrivalsSizeComponentID)).getValue(addressToEntity(alice)), currMoves - 1);
    assertEq(
      ArrivalsList.length(world, LibEncode.hashKeyEntity(addressToEntity(alice), invasionArrival.destination)),
      0
    );
    assertEq(ownedByComponent.getValue(invasionArrival.destination), addressToEntity(alice));
    uint32 unclaimedResource = LibUpdateSpaceRock.getUnclaimedMotherlodeResourceAmount(
      world,
      addressToEntity(alice),
      invasionArrival.destination,
      block.number
    );
    //uint256 mainBaseEntity = mainBaseComponent.getValue(addressToEntity(alice));
    Coord memory mainBaseCoord = getMainBaseCoord(alice);
    for (uint256 i = 2; i <= 6; i++) {
      componentDevSystem.executeTyped(
        P_RequiredResourcesComponentID,
        LibEncode.hashKeyEntity(MainBaseID, i),
        abi.encode()
      );
      vm.prank(alice);
      upgradeBuildingSystem.executeTyped(mainBaseCoord);
    }
    console.log("unclaimed resource = %s", unclaimedResource);
    vm.roll(block.number + 125);

    unclaimedResource = LibUpdateSpaceRock.getUnclaimedMotherlodeResourceAmount(
      world,
      addressToEntity(alice),
      invasionArrival.destination,
      block.number
    );
    console.log("unclaimed resource = %s", unclaimedResource);
    Motherlode memory motherlode = MotherlodeComponent(world.getComponent(MotherlodeComponentID)).getValue(
      invasionArrival.destination
    );

    console.log("motherlodeType: %s ", uint8(motherlode.motherlodeType));
    if (motherlode.motherlodeType == EMotherlodeType.TITANIUM) {
      console.log("titanium");
      vm.prank(alice);
      claimObjectiveSystem.executeTyped(DebugMotherlodeMiningTitaniumObjectiveID);
    } else if (motherlode.motherlodeType == EMotherlodeType.PLATINUM) {
      console.log("platinum");
      vm.prank(alice);
      claimObjectiveSystem.executeTyped(DebugMotherlodeMiningPlatinumObjectiveID);
    } else if (motherlode.motherlodeType == EMotherlodeType.IRIDIUM) {
      console.log("iridium");
      vm.prank(alice);
      claimObjectiveSystem.executeTyped(DebugMotherlodeMiningIridiumObjectiveID);
    } else {
      console.log("other (kimberlite)");
      vm.prank(alice);
      claimObjectiveSystem.executeTyped(DebugMotherlodeMiningKimberliteObjectiveID);
    }
  }
}
