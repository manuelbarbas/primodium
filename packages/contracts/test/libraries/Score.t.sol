// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { Home, ResourceCount, MaxResourceCount, P_ScoreMultiplier, Score } from "codegen/index.sol";

contract ScoreTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    spawn(creator);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }
}
