// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { IWorld } from "solecs/interfaces/IWorld.sol";

// comps

import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";
import { ArrivalsSizeComponent as ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";

// libs
import { ArrivalsList } from "libraries/ArrivalsList.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibMath } from "libraries/LibMath.sol";
import { ABDKMath64x64 as Math } from "abdk-libraries-solidity/ABDKMath64x64.sol";

// types
import { Coord, Arrival, ArrivalUnit, ESendType } from "src/types.sol";

library LibSend {
  function sendUnits(IWorld world, Arrival memory arrival) internal {
    uint256 playerAsteroidEntity = (arrival.sendType == ESendType.REINFORCE)
      ? LibEncode.hashKeyEntity(arrival.to, arrival.destination)
      : LibEncode.hashKeyEntity(arrival.from, arrival.destination);
    ArrivalsList.add(world, playerAsteroidEntity, arrival);

    LibMath.increment(
      ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)),
      (arrival.sendType == ESendType.REINFORCE) ? arrival.to : arrival.from
    );
  }

  function distance(Coord memory a, Coord memory b) internal pure returns (uint32) {
    int128 distanceSquared = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
    return uint32(Math.toUInt(Math.sqrt(Math.fromInt(distanceSquared))));
  }

  function getSlowestUnitSpeed(
    IWorld world,
    ArrivalUnit[] memory arrivalUnits
  ) internal view returns (uint256 slowestSpeed) {
    require(arrivalUnits.length > 0, "LibSend: arrivalUnits length must be greater than 0");
    SpeedComponent speedComponent = SpeedComponent(world.getComponent(SpeedComponentID));
    slowestSpeed = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    for (uint i = 0; i < arrivalUnits.length; i++) {
      if (arrivalUnits[i].count == 0) continue;
      uint256 unitType = uint256(arrivalUnits[i].unitType);
      require(speedComponent.has(unitType), "LibSend: unit type does not have speed component");
      uint256 currSpeed = speedComponent.getValue(unitType);
      if (currSpeed < slowestSpeed) {
        slowestSpeed = currSpeed;
      }
    }
  }
}
