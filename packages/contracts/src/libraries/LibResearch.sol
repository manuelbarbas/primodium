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

import { Bounds, Dimensions } from "src/types.sol";
import { ExpansionResearch } from "src/prototypes.sol";

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

  function getPlayerBounds(IWorld world, uint256 playerEntity) internal view returns (Bounds memory bounds) {
    uint32 playerLevel = LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(playerEntity);
    uint256 researchLevelEntity = LibEncode.hashKeyEntity(ExpansionResearch, playerLevel);

    DimensionsComponent dimensionsComponent = DimensionsComponent(
      getAddressById(world.components(), DimensionsComponentID)
    );
    Dimensions memory asteroidDims = dimensionsComponent.getValue(SingletonID);
    Dimensions memory range = dimensionsComponent.getValue(researchLevelEntity);
    return
      Bounds(
        (asteroidDims.x + range.x) / 2,
        (asteroidDims.y + range.y) / 2,
        (asteroidDims.x - range.x) / 2,
        (asteroidDims.y - range.y) / 2
      );
  }
}
