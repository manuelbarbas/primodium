// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { P_IsObjectiveComponent, ID as P_IsObjectiveComponentID } from "components/P_IsObjectiveComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";

import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { HasCompletedObjectiveComponent, ID as HasCompletedObjectiveComponentID } from "components/HasCompletedObjectiveComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { LibResearch } from "libraries/LibResearch.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibObjective } from "libraries/LibObjective.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibUtilityResource } from "libraries/LibUtilityResource.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { LibReward } from "libraries/LibReward.sol";
import { LibRaid } from "libraries/LibRaid.sol";
import { LibUpdateSpaceRock } from "libraries/LibUpdateSpaceRock.sol";
import { ResourceValue } from "../types.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";

uint256 constant ID = uint256(keccak256("system.ClaimObjective"));

contract ClaimObjectiveSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 objective = abi.decode(args, (uint256));
    uint256 playerEntity = addressToEntity(msg.sender);

    P_IsObjectiveComponent isObjectiveComponent = P_IsObjectiveComponent(
      getAddressById(components, P_IsObjectiveComponentID)
    );
    HasCompletedObjectiveComponent hasCompletedObjective = HasCompletedObjectiveComponent(
      getAddressById(components, HasCompletedObjectiveComponentID)
    );
    require(isObjectiveComponent.has(objective), "[ClaimObjectiveSystem] Objective not registered");

    //Main Base Level
    require(
      LibBuilding.checkMainBaseLevelRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] MainBase level requirement not met"
    );

    //Objective
    require(
      LibObjective.hasCompledtedObjective(world, objective, playerEntity),
      "[ClaimObjectiveSystem] Objective requirements not met"
    );

    //Technology
    require(
      LibResearch.hasResearched(world, objective, playerEntity),
      "[ClaimObjectiveSystem] Research requirements not met"
    );

    //Resources
    if (P_RequiredResourcesComponent(getAddressById(components, P_RequiredResourcesComponentID)).has(objective)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, objective, 1),
        "[ClaimObjectiveSystem] Not enough resources to research"
      );
    }

    //Resource Production
    require(
      LibResource.checkResourceProductionRequirements(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You do not have the required production resources"
    );

    //Max Utility
    require(
      LibUtilityResource.checkMaxUtilityResourceReqs(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You do not have the required Utility resources"
    );

    // has built building
    require(
      LibBuilding.checkHasBuiltBuildingRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You have not built the required building"
    );

    // has the amount of buildings built
    require(
      LibBuilding.checkBuildingCountRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You do not have the required building count"
    );

    //unit count
    require(
      LibUnits.checkUnitRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You do not have the required units"
    );

    //raid requirement
    require(
      LibRaid.checkRaidRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You have not raided the required amount of resources"
    );

    //motherlode mine
    require(
      LibUpdateSpaceRock.checkMotherlodeMinedRequirement(world, playerEntity, objective),
      "[ClaimObjectiveSystem] You have not mined the required amount of motherlodes"
    );

    //can receive rewards
    require(
      LibReward.canReceiveRewards(world, playerEntity, objective),
      "[ClaimObjectiveSystem] Cannot receive rewards"
    );

    hasCompletedObjective.set(LibEncode.hashKeyEntity(objective, playerEntity));

    LibReward.receiveRewards(world, playerEntity, objective);
    return abi.encode(true);
  }

  function executeTyped(uint256 objective) public returns (bytes memory) {
    return execute(abi.encode(objective));
  }
}
