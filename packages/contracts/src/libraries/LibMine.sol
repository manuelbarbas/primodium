// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ResourceResearchComponents } from "../prototypes/ResourceResearchComponents.sol";

import { addressToEntity } from "solecs/utils.sol";

import { MainBaseID, MinerID, LithiumMinerID, BasicMinerID, HardenedDrillID, PrecisionMachineryFactoryID, ConveyorID, SiloID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID, BulletFactoryID } from "../prototypes/Tiles.sol";

library LibMine {
  // allow mine resource if unlocked.
  function mine(
    ResourceResearchComponents memory rrc,
    uint256 minerType,
    Uint256Component lastClaimedAtComponent,
    uint256 resourceKey,
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

    if (resourceKey == IronID) {
      // iron is default unlocked
    } else if (resourceKey == CopperID) {
      // copper is unlocked for mud test
      // if (!rrc.copperResearchComponent.has(addressToEntity(msg.sender))) {
      //   lastClaimedAtComponent.set(entity, endClaimTime);
      //   return 0;
      // }
    } else if (resourceKey == LithiumID) {
      if (!rrc.lithiumResearchComponent.has(addressToEntity(msg.sender))) {
        return 0;
      }
    } else if (resourceKey == TungstenID) {
      if (!rrc.tungstenResearchComponent.has(addressToEntity(msg.sender))) {
        return 0;
      }
    } else if (resourceKey == OsmiumID) {
      if (!rrc.osmiumResearchComponent.has(addressToEntity(msg.sender))) {
        return 0;
      }
    } else if (resourceKey == IridiumID) {
      if (!rrc.iridiumResearchComponent.has(addressToEntity(msg.sender))) {
        return 0;
      }
    } else if (resourceKey == KimberliteID) {
      if (!rrc.kimberliteResearchComponent.has(addressToEntity(msg.sender))) {
        return 0;
      }
    } else {
      // invalid resource
      return 0;
    }

    uint256 incBy = MINE_COUNT_PER_BLOCK * (endClaimTime - startClaimTime);
    lastClaimedAtComponent.set(entity, endClaimTime);
    return incBy;
  }
}
