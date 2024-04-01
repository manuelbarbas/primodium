// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { P_GameConfig, BuildingType, OwnedBy, Position, P_Transportables, P_WormholeConfig, P_WormholeConfigData, Wormhole, WormholeData, CooldownEnd, P_ScoreMultiplier } from "codegen/index.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibScore } from "libraries/LibScore.sol";
import { LibWormhole } from "libraries/LibWormhole.sol";
import { EScoreType } from "src/Types.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";
import { WormholeBasePrototypeId } from "codegen/Prototypes.sol";

contract WormholeDepositSystem is PrimodiumSystem {
  modifier _advanceTurn() {
    P_WormholeConfigData memory wormholeConfig = P_WormholeConfig.get();
    WormholeData memory wormholeData = Wormhole.get();

    uint256 turnDuration = (wormholeConfig.turnDuration * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    uint256 expectedTurn = (block.timestamp - wormholeConfig.initTime) / turnDuration;

    if (wormholeData.turn < expectedTurn) {
      Wormhole.set(
        WormholeData({
          turn: expectedTurn,
          resource: LibWormhole.getRandomResource(wormholeData.hash, wormholeData.resource),
          hash: blockhash(block.number)
        })
      );
    }
    _;
  }

  function wormholeDeposit(
    bytes32 wormholeBaseEntity,
    uint256 count
  ) public _claimResources(Position.getParentEntity(wormholeBaseEntity)) _advanceTurn {
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

    uint256 cooldownLength = (P_WormholeConfig.getCooldown() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    CooldownEnd.set(wormholeBaseEntity, block.timestamp + cooldownLength);

    Wormhole.setHash(
      keccak256(abi.encode(uint256(wormholeBaseEntity), count, block.timestamp, blockhash(block.number - 1)))
    );
  }
}
