// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

library LibResearch {
  // research fast miner with 100 iron and 100 copper
  function researchFastMiner(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    BoolComponent fastMinerResearchComponent,
    uint256 entity
  ) public returns (bytes memory) {
    uint256 IRON_REQUIRED = 100;
    uint256 COPPER_REQUIRED = 100;

    if (fastMinerResearchComponent.has(entity) && fastMinerResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curCopper < COPPER_REQUIRED || curIron < IRON_REQUIRED) {
      return abi.encode(false);
    } else {
      copperResourceComponent.set(entity, curCopper - COPPER_REQUIRED);
      ironResourceComponent.set(entity, curIron - IRON_REQUIRED);

      fastMinerResearchComponent.set(entity);
      return abi.encode(true);
    }
  }
}
