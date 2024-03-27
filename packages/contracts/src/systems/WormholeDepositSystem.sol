// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { OwnedBy, Position, P_Transportables, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, CooldownEnd, P_ScoreMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibScore } from "libraries/LibScore.sol";
import { EScoreType } from "src/Types.sol";

contract WormholeDepositSystem is PrimodiumSystem {
  function getRandomResource(bytes32 seed, uint8 prevResource) private view returns (uint8 resource) {
    do {
      resource = uint8(uint256(seed) % P_Transportables.length());
    } while (resource != prevResource);
  }

  function advanceTurn() private {
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();

    uint256 expectedTurn = (block.timestamp - wormholeConfig.startTime) / wormholeConfig.turnDuration;
    uint256 turn = Wormhole.getTurn();

    if (turn >= expectedTurn) return;

    Wormhole.set(
      WormholeData({
        turn: expectedTurn,
        resource: getRandomResource(Wormhole.getHash(), Wormhole.getResource()),
        hash: blockhash(block.number)
      })
    );
  }

  function wormholeDeposit(
    bytes32 wormholeEntity,
    uint256 count
  ) public _claimResources(Position.getParentEntity(wormholeEntity)) {
    bytes32 playerEntity = _player();
    bytes32 asteroidEntity = Position.getParentEntity(wormholeEntity);

    require(OwnedBy.get(asteroidEntity) == playerEntity, "[WormholeDeposit] Only owner can deposit");
    require(CooldownEnd.get(wormholeEntity) < block.timestamp, "[WormholeDeposit] Cooldown not finished");

    LibStorage.checkedDecreaseStoredResource(asteroidEntity, Wormhole.getResource(), count);

    uint256 scoreIncrease = count * P_ScoreMultiplier.get(Wormhole.getResource());
    LibScore.addScore(playerEntity, EScoreType.Extraction, scoreIncrease);

    CooldownEnd.set(wormholeEntity, block.timestamp + P_WormholeConfig.getCooldown());

    Wormhole.setHash(
      keccak256(abi.encode(uint256(wormholeEntity), count, block.timestamp, blockhash(block.number - 1)))
    );
  }
}
