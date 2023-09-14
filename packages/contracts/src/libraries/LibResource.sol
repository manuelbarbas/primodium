// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EBuilding } from "src/Types.sol";
import { LibMath } from "libraries/LibMath.sol";
import { P_RequiredResources, P_RequiredResourcesData, P_EnumToPrototype } from "codegen/Tables.sol";
import { BuildingKey } from "src/Keys.sol";

library LibResource {
  function hasRequiredResources(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    uint32 level,
    uint32 count
  ) internal view returns (bool) {
    if (P_RequiredResources.lengthResources(buildingPrototype, level) == 0) return true;

    return false;
    // to implement when player storage works

    // P_RequiredResourcesData memory requiredResources = requiredResourcesComponent.get(entity);
    // for (uint256 i = 0; i < requiredResources.resources.length; i++) {
    //   uint32 resourceCost = requiredResources.values[i] * count;
    //   uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
    //   uint32 playerResourceCount = LibMath.getSafe(itemComponent, playerResourceEntity);

    //   if (LibMath.getSafe(productionComponent, playerResourceEntity) > 0) {
    //     playerResourceCount +=
    //       productionComponent.getValue(playerResourceEntity) *
    //       uint32(block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceEntity));
    //   }

    //   if (resourceCost > playerResourceCount) return false;
    // }
    // return true;
  }

  function hasRequiredResources(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    uint32 level
  ) internal view returns (bool) {
    return hasRequiredResources(playerEntity, buildingPrototype, level, 1);
  }

  function hasRequiredResources(
    bytes32 playerEntity,
    EBuilding buildingType,
    uint32 level
  ) internal view returns (bool) {
    return hasRequiredResources(playerEntity, P_EnumToPrototype.get(BuildingKey, uint8(buildingType)), level, 1);
  }
}
