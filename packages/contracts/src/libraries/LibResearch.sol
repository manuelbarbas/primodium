// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibResearch {
  // ###########################################################################
  // Check that the user has researched a given component

  function hasResearched(
    Uint256Component requiredResearchComponent,
    BoolComponent researchComponent,
    uint256 entity,
    uint256 playerEntity
  ) internal view returns (bool) {
    return
      !requiredResearchComponent.has(entity) ||
      researchComponent.has(LibEncode.hashKeyEntity(requiredResearchComponent.getValue(entity), playerEntity));
  }

  // ###########################################################################
  // Write last researched time into LastResearchedComponent

  function setResearchTime(Uint256Component component, uint256 researchKey, uint256 entity) internal {
    uint256 hashedResearchKey = LibEncode.hashKeyEntity(researchKey, entity);
    component.set(hashedResearchKey, block.number);
  }
}
