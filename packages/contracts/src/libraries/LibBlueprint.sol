// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { BlueprintComponent } from "components/BlueprintComponent.sol";

library LibBlueprint {
  /**
   * @dev Creates a blueprint by setting the building type and coordinates in the BlueprintComponent.
   * @param buildingType The type of building for the blueprint.
   * @param blueprint The blueprint coordinates as an array of integers.
   */
  function createBlueprint(
    BlueprintComponent blueprintComponent,
    uint256 buildingType,
    int32[] memory blueprint
  ) internal {
    require(blueprint.length % 2 == 0, "[BlueprintSystem]: odd array length");
    require(!blueprintComponent.has(buildingType), "[BlueprintSystem]: building already has a blueprint");
    blueprintComponent.set(buildingType, blueprint);
  }
}
