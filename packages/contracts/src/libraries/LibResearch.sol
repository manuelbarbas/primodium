// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";

import { LibEncode } from "./LibEncode.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component

  function hasResearched(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    P_RequiredResearchComponent requiredResearchComponent = P_RequiredResearchComponent(
      getAddressById(world.components(), P_RequiredResearchComponentID)
    );

    if (!requiredResearchComponent.has(entity)) return true;

    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(
      getAddressById(world.components(), HasResearchedComponentID)
    );
    return
      hasResearchedComponent.has(LibEncode.hashKeyEntity(requiredResearchComponent.getValue(entity), playerEntity));
  }
}
