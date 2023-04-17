// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibBuild {
  // Build BasicMiner with 100 IronResource
  function buildBasicMiner(Uint256Component ironResourceComponent, uint256 entity) internal {
    uint256 IRON_REQUIRED = 100;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
    }
  }

  // Build Node with 50 IronResource
  function buildNode(Uint256Component ironResourceComponent, uint256 entity) internal {
    uint256 IRON_REQUIRED = 50;

    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curIron < IRON_REQUIRED) {
      revert("not enough iron");
    } else {
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);
    }
  }

  // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
  function buildBasicBatteryFactory(
    Uint256Component ironPlateCraftedComponent,
    Uint256Component copperResourceComponent,
    uint256 entity
  ) internal {
    uint256 IRON_PLATE_REQUIRED = 20;
    uint256 COPPER_REQUIRED = 50;

    uint256 curIronPlate = ironPlateCraftedComponent.has(entity) ? ironPlateCraftedComponent.getValue(entity) : 0;
    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;

    if (curIronPlate < IRON_PLATE_REQUIRED) {
      revert("not enough iron plate");
    } else if (curCopper < COPPER_REQUIRED) {
      revert("not enough copper");
    } else {
      ironPlateCraftedComponent.set(entity, curIronPlate - IRON_PLATE_REQUIRED);
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
    }
  }
}
