// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";

import { getAddressById } from "solecs/utils.sol";
import { P_ObjectiveRequirementComponent, ID as P_ObjectiveRequirementComponentID } from "components/P_ObjectiveRequirementComponent.sol";
import { HasCompletedObjectiveComponent, ID as HasCompletedObjectiveComponentID } from "components/HasCompletedObjectiveComponent.sol";

import { LibEncode } from "libraries/LibEncode.sol";

library LibObjective {
  // Check that the user has researched a given component
  function hasCompledtedObjective(
    IWorld world,
    uint256 entity,
    uint256 playerEntity
  ) internal view returns (bool) {
    P_ObjectiveRequirementComponent objectiveRequirementComponent = P_ObjectiveRequirementComponent(
      getAddressById(world.components(), P_ObjectiveRequirementComponentID)
    );

    if (!objectiveRequirementComponent.has(entity)) return true;

    HasCompletedObjectiveComponent hasCompletedObjectiveComponent = HasCompletedObjectiveComponent(
      getAddressById(world.components(), HasCompletedObjectiveComponentID)
    );
    return
      hasCompletedObjectiveComponent.has(
        LibEncode.hashKeyEntity(objectiveRequirementComponent.getValue(entity), playerEntity)
      );
  }
}
