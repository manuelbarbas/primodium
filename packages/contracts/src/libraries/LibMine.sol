// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";

import { MainBaseID, MinerID, LithiumMinerID, BasicMinerID, HardenedDrillID, PrecisionMachineryFactoryID, ConveyorID, SiloID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID, BulletFactoryID } from "../prototypes/Tiles.sol";

import { LibEncode } from "./LibEncode.sol";

library LibMine {
  // allow mine resource if unlocked.
  function mine(
    Uint256Component lastClaimedAtComponent,
    BoolComponent researchComponent,
    uint256 minerType,
    uint256 resourceKey,
    uint256 researchKey,
    uint256 entity
  ) internal returns (uint256) {
    // TODO: Change rate to be variable based on miner
    uint256 MINE_COUNT_PER_BLOCK = 10;

    if (minerType == MinerID || minerType == LithiumMinerID) {
      MINE_COUNT_PER_BLOCK = 10;
    } else if (minerType == BasicMinerID) {
      MINE_COUNT_PER_BLOCK = 1;
    } else if (minerType == HardenedDrillID) {
      MINE_COUNT_PER_BLOCK = 2;
    } else if (minerType == PrecisionMachineryFactoryID) {
      MINE_COUNT_PER_BLOCK = 3;
    }

    uint256 startClaimTime = lastClaimedAtComponent.getValue(entity);
    uint256 endClaimTime = block.number;
    uint256 hashedResearchKey = LibEncode.hashFromAddress(researchKey, entityToAddress(entity));

    if (resourceKey == IronID) {
      // iron is default unlocked
    }
    // copper is unlocked for mud test
    else if (resourceKey == CopperID) {}
    // all other resources, including copper in production, require research
    else {
      if (!researchComponent.has(hashedResearchKey)) {
        return 0;
      }
    }

    uint256 incBy = MINE_COUNT_PER_BLOCK * (endClaimTime - startClaimTime);
    lastClaimedAtComponent.set(entity, endClaimTime);
    return incBy;
  }
}
