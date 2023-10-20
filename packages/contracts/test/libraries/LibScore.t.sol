// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibScoreTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 unitPrototype = "unitPrototype";
  bytes32 buildingEntity = "building";
  uint256 level = 2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    BuildingType.set(buildingEntity, buildingPrototype);
    OwnedBy.set(buildingEntity, playerEntity);
  }

  function testScoreHook() public {
    MaxResourceCount.set(playerEntity, uint8(Iron), 1000);
    ResourceCount.set(playerEntity, uint8(Iron), 0);

    assertEq(Score.get(playerEntity), 0, "score should be 0");
    ResourceCount.set(playerEntity, uint8(Iron), 100);
    assertEq(Score.get(playerEntity), P_ScoreMultiplier.get(uint8(Iron)) * 100, "score does not match");
  }
}
