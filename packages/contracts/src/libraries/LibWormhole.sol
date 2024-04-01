// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BuildingType, OwnedBy, Position, P_Transportables, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, CooldownEnd, P_ScoreMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibScore } from "libraries/LibScore.sol";
import { EScoreType } from "src/Types.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";

library LibWormhole {
  function getRandomResource(bytes32 seed, uint8 prevResource) internal view returns (uint8 resource) {
    do {
      seed = keccak256(abi.encode(seed));
      resource = uint8(uint256(seed) % P_Transportables.length());
    } while (resource == prevResource);
  }
}
