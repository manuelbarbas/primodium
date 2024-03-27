// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { BuildingType, OwnedBy, Position, P_Transportables, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, CooldownEnd, P_ScoreMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibScore } from "libraries/LibScore.sol";
import { EScoreType } from "src/Types.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";

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
    bytes32 wormholeBaseEntity,
    uint256 count
  ) public _claimResources(Position.getParentEntity(wormholeBaseEntity)) {
    bytes32 playerEntity = _player();
    bytes32 asteroidEntity = OwnedBy.get(wormholeBaseEntity);

    require(
      BuildingType.get(wormholeBaseEntity) == WormholeBasePrototypeId,
      "[WormholeDeposit] Building is not a wormhole generator"
    );
    require(OwnedBy.get(asteroidEntity) == playerEntity, "[WormholeDeposit] Only owner can deposit");
    require(CooldownEnd.get(wormholeBaseEntity) <= block.timestamp, "[WormholeDeposit] Wormhole in cooldown");

    LibStorage.checkedDecreaseStoredResource(asteroidEntity, Wormhole.getResource(), count);

    uint256 scoreIncrease = count * P_ScoreMultiplier.get(Wormhole.getResource());
    LibScore.addScore(playerEntity, EScoreType.Extraction, scoreIncrease);

    CooldownEnd.set(wormholeBaseEntity, block.timestamp + P_WormholeConfig.getCooldown());

    Wormhole.setHash(
      keccak256(abi.encode(uint256(wormholeBaseEntity), count, block.timestamp, blockhash(block.number - 1)))
    );
  }
}
