// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { EObjectives } from "src/Types.sol";

contract ClaimObjectiveSystem is PrimodiumSystem {
  function claimObjective(EObjectives objective) public {
    // P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(
    //   getAddressById(components, P_IsObjectiveComponentID)
    // );
    // HasCompletedObjectiveComponent hasCompletedObjective = HasCompletedObjectiveComponent(
    //   getAddressById(components, HasCompletedObjectiveComponentID)
    // );
    // require(isObjectiveComponent.has(objective), "[ClaimObjectiveSystem] Objective not registered");
    // require(
    //   !hasCompletedObjective.has(LibEncode.hashKeyEntity(objective, playerEntity)),
    //   "[ClaimObjectiveSystem] Objective already completed"
    // );
    // //Main Base Level
    // require(
    //   LibBuilding.checkMainBaseLevelRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] MainBase level requirement not met"
    // );
    // //Objective
    // require(
    //   LibObjective.hasCompledtedObjective(world, objective, playerEntity),
    //   "[ClaimObjectiveSystem] Objective requirements not met"
    // );
    // //Technology
    // require(
    //   LibResearch.hasResearched(world, objective, playerEntity),
    //   "[ClaimObjectiveSystem] Research requirements not met"
    // );
    // //Resources
    // if (P_RequiredResourcesComponent(getAddressById(components, P_RequiredResourcesComponentID)).has(objective)) {
    //   require(
    //     LibResource.hasRequiredResources(world, playerEntity, objective, 1),
    //     "[ClaimObjectiveSystem] Not enough resources to research"
    //   );
    // }
    // //Resource Production
    // require(
    //   LibResource.checkResourceProductionRequirements(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You do not have the required production resources"
    // );
    // //Max Utility
    // require(
    //   LibUtilityResource.checkMaxUtilityResourceReqs(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You do not have the required Utility resources"
    // );
    // // has built building
    // require(
    //   LibBuilding.checkHasBuiltBuildingRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You have not built the required building"
    // );
    // // has the amount of buildings built
    // require(
    //   LibBuilding.checkBuildingCountRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You do not have the required building count"
    // );
    // //unit count
    // require(
    //   LibUnits.checkUnitRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You do not have the required units"
    // );
    // //raid requirement
    // require(
    //   LibRaid.checkRaidRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You have not raided the required amount of resources"
    // );
    // //motherlode mine
    // require(
    //   LibUpdateSpaceRock.checkMotherlodeMinedRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You have not mined the required amount of motherlodes"
    // );
    // //destroyed units
    // require(
    //   LibBattle.checkDestroyedUnitsRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] You have not destroyed the required amount of units"
    // );
    // //can receive rewards
    // require(
    //   LibReward.canReceiveRewards(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] Cannot receive rewards"
    // );
    // require(
    //   LibPirateAsteroid.checkDefeatedPirateAsteroidRequirement(world, playerEntity, objective),
    //   "[ClaimObjectiveSystem] Pirate Base not defeated"
    // );
    // hasCompletedObjective.set(LibEncode.hashKeyEntity(objective, playerEntity));
    // IOnEntitySubsystem(getAddressById(world.systems(), S_ReceiveRewardsSystemID)).executeTyped(msg.sender, objective);
    // if (P_SpawnPirateAsteroidComponent(world.getComponent(P_SpawnPirateAsteroidComponentID)).has(objective)) {
    //   IOnEntitySubsystem(getAddressById(world.systems(), S_SpawnPirateAsteroidSystemID)).executeTyped(
    //     msg.sender,
    //     objective
    //   );
    // }
  }
}
