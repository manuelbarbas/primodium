// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component

  function hasResearched(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(world.components(), RequiredResearchComponentID)
    );

    if (!requiredResearchComponent.has(entity)) return true;

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(
      getAddressById(world.components(), HasResearchedComponentID)
    );
    return
      hasResearchedComponent.has(LibEncode.hashKeyEntity(requiredResearchComponent.getValue(entity), playerEntity));
  }
}
