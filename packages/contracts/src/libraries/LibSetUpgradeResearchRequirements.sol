pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetUpgradeResearchRequirements {
  function setRequiredResearchForEntityUpgradeToLevel(
    Uint256Component requiredResearchComponent,
    uint256 entity,
    uint256 researchId,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    requiredResearchComponent.set(LibEncode.hashKeyEntity(researchId, buildingIdLevel), researchId);
  }
}
