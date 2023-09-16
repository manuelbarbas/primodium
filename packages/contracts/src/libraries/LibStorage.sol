// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_ListMaxResourceUpgrades, MaxResourceCount } from "codegen/Tables.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SetPlayerResource } from "libraries/SetPlayerResource.sol";
import { EResource } from "src/Types.sol";

library LibStorage {
  /* -------------------------- Non-Utility Resources ------------------------- */
  function decreaseStoredResource(
    bytes32 playerEntity,
    EResource resource,
    uint32 resourceToDecrease
  ) internal {
    uint32 resourceCount = SetPlayerResource.get(playerEntity, resource);
    uint32 newResourceCount = resourceCount < resourceToDecrease ? 0 : resourceCount - resourceToDecrease;
    SetPlayerResource.set(playerEntity, resource, newResourceCount);
  }

  function increaseStoredResource(
    bytes32 playerEntity,
    EResource resource,
    uint32 resourceToAdd
  ) internal {
    uint32 resourceCount = SetPlayerResource.get(playerEntity, resource);
    uint32 maxResources = MaxResourceCount.get(playerEntity, resource);
    uint32 newResourceCount = LibMath.min(resourceCount + resourceToAdd, maxResources);
    SetPlayerResource.set(playerEntity, resource, newResourceCount);
  }

  /* ---------------------------- Utility Resources --------------------------- */

  function increaseMaxUtility(
    bytes32 playerEntity,
    EResource resource,
    uint32 amountToIncrease
  ) internal {
    uint32 prevMax = MaxResourceCount.get(playerEntity, resource);
    MaxResourceCount.set(playerEntity, resource, prevMax + amountToIncrease);
  }

  function decreaseMaxUtility(
    bytes32 playerEntity,
    EResource resource,
    uint32 amountToDecrease
  ) internal {
    uint32 maxUtility = MaxResourceCount.get(playerEntity, resource);
    if (maxUtility < amountToDecrease) {
      MaxResourceCount.set(playerEntity, resource, 0);
      return;
    }
    MaxResourceCount.set(playerEntity, resource, maxUtility - amountToDecrease);
  }
}
