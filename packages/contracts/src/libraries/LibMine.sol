// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ResourceResearchComponents } from "../prototypes/ResourceResearchComponents.sol";

import { addressToEntity } from "solecs/utils.sol";

import { MainBaseID, MinerID, ConveyerID, SiloID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID, BulletFactoryID } from "../prototypes/Tiles.sol";

library LibMine {
  // allow mine resource if unlocked.
  // CopperResearchComponent
  // LithiumResearchComponent
  // TitaniumResearchComponent
  // OsmiumResearchComponent
  // TungstenResearchComponent
  // IridiumResearchComponent
  // KimberliteResearchComponent

  function mine(
    ResourceResearchComponents memory rrc,
    Uint256Component lastClaimedComponent,
    uint256 resourceKey,
    uint256 entity
  ) public returns (uint256) {
    // TODO: Change rate to be variable based on miner
    uint256 MINE_COUNT_PER_BLOCK = 10;

    uint256 endClaimTime = block.number;

    if (resourceKey == 0) {
      revert("invalid resource key");
    } else if (resourceKey == IronID) {
      // iron is default unlocked
    } else if (resourceKey == CopperID) {
      // copper is unlocked for mud test
      // if (!rrc.copperResearchComponent.has(addressToEntity(msg.sender))) {
      //   lastClaimedComponent.set(entity, endClaimTime);
      //   return 0;
      // }
    } else if (resourceKey == LithiumID) {
      if (!rrc.lithiumResearchComponent.has(addressToEntity(msg.sender))) {
        lastClaimedComponent.set(entity, endClaimTime);
        return 0;
      }
    } else if (resourceKey == TungstenID) {
      if (!rrc.tungstenResearchComponent.has(addressToEntity(msg.sender))) {
        lastClaimedComponent.set(entity, endClaimTime);
        return 0;
      }
    } else if (resourceKey == OsmiumID) {
      if (!rrc.osmiumResearchComponent.has(addressToEntity(msg.sender))) {
        lastClaimedComponent.set(entity, endClaimTime);
        return 0;
      }
    } else if (resourceKey == IridiumID) {
      if (!rrc.iridiumResearchComponent.has(addressToEntity(msg.sender))) {
        lastClaimedComponent.set(entity, endClaimTime);
        return 0;
      }
    } else if (resourceKey == KimberliteID) {
      if (!rrc.kimberliteResearchComponent.has(addressToEntity(msg.sender))) {
        lastClaimedComponent.set(entity, endClaimTime);
        return 0;
      }
    }

    uint256 startClaimTime = lastClaimedComponent.getValue(entity);
    uint256 incBy = MINE_COUNT_PER_BLOCK * (endClaimTime - startClaimTime);
    return incBy;
  }
}
