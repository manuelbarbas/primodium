// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource } from "src/Types.sol";
import { MainBasePrototypeId, DroidPrototypeId } from "codegen/Prototypes.sol";

import { LibRaidableAsteroid } from "libraries/LibRaidableAsteroid.sol";

contract LibRaidableAsteroidTest is PrimodiumTest {
  // todo: check P_AsteroidProbabilityConfig adds up to 100
}
