// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { P_GameConfig, BuildingType, OwnedBy, Position, P_Transportables, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, CooldownEnd, P_PointMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibPoints } from "libraries/LibPoints.sol";
import { EPointType } from "src/Types.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibWormhole {
  function advanceTurn() internal returns (uint8) {
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();
    WormholeData memory wormholeData = Wormhole.get();

    uint256 turnDuration = (wormholeConfig.turnDuration * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    uint256 expectedTurn = (block.timestamp - wormholeConfig.initTime) / turnDuration;

    if (wormholeData.turn < expectedTurn) {
      uint8 newNextResource = getRandomResource(wormholeData.hash, expectedTurn, wormholeData.nextResource);
      Wormhole.set(
        WormholeData({
          turn: expectedTurn,
          resource: wormholeData.nextResource,
          nextResource: newNextResource,
          hash: blockhash(block.number)
        })
      );
      return wormholeData.nextResource;
    }
    return wormholeData.resource;
  }

  function getRandomResource(bytes32 seed, uint256 turn, uint8 prevResource) internal view returns (uint8 resource) {
    do {
      seed = keccak256(abi.encode(seed, turn));
      // one indexed
      resource = uint8(uint256(seed) % P_Transportables.length()) + 1;
    } while (resource == prevResource);
  }
}
