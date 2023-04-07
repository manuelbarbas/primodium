// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

library LibResearch {
  function craftBullet(
    Uint256Component ironResourceComponent,
    Uint256Component copperResourceComponent,
    BoolComponent fastMinerResearchComponent,
    uint256 entity
  ) public returns (bytes memory) {
    if (fastMinerResearchComponent.has(entity) && fastMinerResearchComponent.getValue(entity)) {
      return abi.encode(false);
    }

    uint256 curCopper = copperResourceComponent.has(entity) ? copperResourceComponent.getValue(entity) : 0;
    uint256 curIron = ironResourceComponent.has(entity) ? ironResourceComponent.getValue(entity) : 0;

    if (curCopper < 100 || curIron < 100) {
      return abi.encode(false);
    } else {
      copperResourceComponent.set(entity, curCopper - 100);
      ironResourceComponent.set(entity, curIron - 100);

      fastMinerResearchComponent.set(entity);
      return abi.encode(true);
    }
  }
}
