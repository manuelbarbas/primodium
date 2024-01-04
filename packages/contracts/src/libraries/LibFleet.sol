// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, Arrival, ERock, EResource } from "src/Types.sol";
import { Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibMath } from "libraries/LibMath.sol";
import { SendArgs } from "src/Types.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";

library LibFleet {
  /// @notice creates a fleet.
  function createFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    uint256[NUM_UNITS] memory unitCounts,
    uint256[NUM_RESOURCE] memory resourceCounts
  ) internal returns (bytes32 fleetId) {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only create fleet on owned space rock");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {}

    // arrivalId = keccak256(abi.encode(arrival));
    // bytes32 player = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    // ArrivalsMap.set(player, arrival.destination, arrivalId, arrival);
    // ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) + 1);
  }
}
