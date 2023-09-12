// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { P_ObjectiveRequirementComponent, ID as P_ObjectiveRequirementComponentID } from "components/P_ObjectiveRequirementComponent.sol";
import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { HasCompletedObjectiveComponent, ID as HasCompletedObjectiveComponentID} from "components/HasCompletedObjectiveComponent.sol"
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { Bounds, Dimensions } from "src/types.sol";
import { ExpansionResearch } from "src/prototypes.sol";

library LibObjective {
  // Check that the user has researched a given component
  function hasCompledtedObjective(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    P_ObjectiveRequirementComponent objectiveRequirementComponent = P_ObjectiveRequirementComponent(
      getAddressById(world.components(), P_ObjectiveRequirementComponentID)
    );

    if (!objectiveRequirementComponent.has(entity)) return true;

    HasCompletedObjectiveComponent hasCompletedObjectiveComponent = HasCompletedObjectiveComponent(
      getAddressById(world.components(), HasCompletedObjectiveComponentID)
    );
    return
      hasCompletedObjectiveComponent.has(LibEncode.hashKeyEntity(objectiveRequirementComponent.getValue(entity), playerEntity));
  }


}
