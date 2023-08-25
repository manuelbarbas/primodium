// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

import { P_UnitTravelSpeedComponent as SpeedComponent, ID as SpeedComponentID } from "components/P_UnitTravelSpeedComponent.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibSend } from "libraries/LibSend.sol";
import { LibUnits } from "libraries/LibUnits.sol";

contract LibSendtest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function setUp() public override {
    super.setUp();
  }

  function testSpeed() public {
    vm.startPrank(alice);
    SpeedComponent speedComponent = SpeedComponent(component(SpeedComponentID));
    uint256 unit1 = DebugUnit;
    uint256 unit2 = DebugUnit2;
    uint32 unit1Level = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(alice), unit1);
    uint32 unit2Level = LibUnits.getPlayerUnitTypeLevel(world, addressToEntity(alice), unit2);
    uint32 speed1 = speedComponent.getValue(LibEncode.hashKeyEntity(unit1, unit1Level));
    uint32 speed2 = speedComponent.getValue(LibEncode.hashKeyEntity(unit2, unit2Level));
    uint32 slowest = LibMath.min(speed1, speed2);

    ArrivalUnit[] memory units = new ArrivalUnit[](2);
    units[0] = ArrivalUnit(unit1, 10);
    units[1] = ArrivalUnit(unit2, 10);
    assertEq(slowest, LibSend.getSlowestUnitSpeed(world, addressToEntity(alice), units));
    vm.stopPrank();
  }
}
