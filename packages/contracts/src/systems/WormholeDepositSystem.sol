// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { Position, P_WormholeConfig, P_WormholeConfigData, Wormhole } from "codegen/index.sol";

contract WormholeDepositSystem is PrimodiumSystem {
  function _advanceTurn() {
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();
    uint256 expectedTurn = (block.timestamp - wormholeConfig.startTime) / wormholeConfig.turnDuration;
    uint256 turn = Wormhole.getTurn();

    if (wormhole.turn >= expectedTurn) return;

    wormhole.turn = expectedTurn;
    wormhole.resource = getRandomResource(wormhole.nextResourceHash);
    Wormhole.set(WormholeData({ turn: expectedTurn, resource: wormhole.resource, nextResourceHash: 1 }));
  }

  function wormholeDeposit(
    bytes32 wormholeEntity,
    uint256 count
  ) public _claimResources(Position.getParentEntity(asteroidEntity)) {
    bytes32 playerEntity = _player();
    bytes32 asteroidEntity = Position.getParentEntity(wormholeEntity);

    require(OwnedBy.get(asteroidEntity) == playerEntity, "[WormholeDeposit] Only owner can deposit");
    require(CooldownEnd.get(wormholeEntity) < block.timestamp, "[WormholeDeposit] Cooldown not finished");

    LibResource.checkedDecreaseStoredResource(asteroidEntity, Wormhole.getResource(), count);
    CooldownEnd.set(wormholeEntity, block.timestamp + Cooldown.get(wormholeEntity));
    Wormhole.setNextResourceHash(
      keccak256(abi.encode(playerEntity, count, block.timestamp, block.blockhash(blockNumber - 1)))
    );
  }
}
