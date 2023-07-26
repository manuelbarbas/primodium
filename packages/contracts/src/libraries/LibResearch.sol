// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component

  function hasResearched(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(world.components(), ResearchComponentID));

    if (!requiredResearchComponent.has(entity)) return true;

    return researchComponent.has(LibEncode.hashKeyEntity(requiredResearchComponent.getValue(entity), playerEntity));
  }
}
