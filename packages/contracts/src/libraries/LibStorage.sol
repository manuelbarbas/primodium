// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_ListMaxResourceUpgrades, MaxResourceCount } from "codegen/Tables.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SetPlayerResource } from "libraries/SetPlayerResource.sol";
import { EResource } from "src/Types.sol";

library LibStorage {
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
}
