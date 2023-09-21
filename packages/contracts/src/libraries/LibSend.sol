// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ArrivalUnit, ESendType, Arrival } from "src/Types.sol";
import { PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount } from "codegen/Tables.sol";
import { ArrivalsSet } from "libraries/ArrivalsSet.sol";
import { LibMath } from "libraries/LibMath.sol";

library LibSend {
  function sendUnits(Arrival memory arrival) internal {
    bytes32 player = arrival.sendType == ESendType.Reinforce ? arrival.to : arrival.from;
    bytes32 asteroid = arrival.sendType == ESendType.Reinforce ? arrival.destination : arrival.origin;
    ArrivalsSet.add(player, asteroid, arrival);
    ArrivalCount.set(arrival.from, ArrivalCount.get(arrival.from) + 1);
  }

  function getSlowestUnitSpeed(
    bytes32 playerEntity,
    bytes32[] memory unitTypes,
    uint256[] memory unitCounts
  ) internal view returns (uint256 slowestSpeed) {
    require(unitTypes.length > 0, "LibSend: arrivalUnits length must be greater than 0");
    slowestSpeed = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    for (uint256 i = 0; i < unitTypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 unitLevel = UnitLevel.get(playerEntity, unitTypes[i]);
      uint256 speed = P_Unit.getSpeed(unitTypes[i], unitLevel);
      require(speed > 0, "LibSend: unit type has no speed");
      if (speed < slowestSpeed) {
        slowestSpeed = speed;
      }
    }
  }

  function getArrivalBlock(
    PositionData memory origin,
    PositionData memory destination,
    bytes32 playerEntity,
    bytes32[] memory unitTypes,
    uint256[] memory unitCounts
  ) internal view returns (uint256) {
    P_GameConfigData memory config = P_GameConfig.get();
    uint256 unitSpeed = getSlowestUnitSpeed(playerEntity, unitTypes, unitCounts);
    return block.number + ((LibMath.distance(origin, destination) * 100 * 100) / (config.moveSpeed * unitSpeed));
  }
}
