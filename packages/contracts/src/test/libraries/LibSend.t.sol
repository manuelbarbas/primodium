// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";

import "../../prototypes.sol";

import { LibMath } from "../../libraries/LibMath.sol";
import { LibSend } from "../../libraries/LibSend.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";

import { Coord, Dimensions, ArrivalUnit } from "../../types.sol";

contract LibSendtest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testSpeed() public {
    SpeedComponent speedComponent = SpeedComponent(world.getComponent(SpeedComponentID));
    uint256 unit1 = DebugUnit;
    uint256 unit2 = DebugUnit2;
    uint32 speed1 = speedComponent.getValue(unit1);
    uint32 speed2 = speedComponent.getValue(unit2);
    uint32 slowest = LibMath.min(speed1, speed2);

    ArrivalUnit[] memory units = new ArrivalUnit[](2);
    units[0] = ArrivalUnit(unit1, 10);
    units[1] = ArrivalUnit(unit2, 10);
    assertEq(slowest, LibSend.getSlowestUnitSpeed(world, units));
  }
}
