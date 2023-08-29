// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { SingletonID } from "solecs/SingletonID.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";

import { P_RequiredResearchComponent, ID as P_RequiredResearchComponentID } from "components/P_RequiredResearchComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { Bounds, Dimensions } from "src/types.sol";
import { ExpansionResearch } from "src/prototypes.sol";

library LibResearch {
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

  function checkMainBaseLevelRequirement(
    IWorld world,
    uint256 playerEntity,
    uint256 entity
  ) internal view returns (bool) {
    LevelComponent levelComponent = LevelComponent(getAddressById(world.components(), LevelComponentID));
    if (!levelComponent.has(entity)) return true;
    uint256 mainLevel = LibBuilding.getBaseLevel(world, playerEntity);
    return mainLevel >= levelComponent.getValue(entity);
  }

  function checkResourceProductionRequirements(
    IWorld world,
    uint256 playerEntity,
    uint256 entityType,
    uint32 level
  ) internal view returns (bool) {}
}
