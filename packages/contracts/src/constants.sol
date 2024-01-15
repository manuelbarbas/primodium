// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EUnit } from "codegen/common.sol";

uint256 constant UNIT_SPEED_SCALE = 100;
uint256 constant WORLD_SPEED_SCALE = 100;
uint256 constant MULTIPLIER_SCALE = 100;

uint256 constant NUM_UNITS = 8;
uint256 constant NUM_RESOURCE = 27;
uint256 constant NUM_FLEET_GRACEPERIOD = 60 * 30; // 30 minutes
address constant DUMMY_ADDRESS = 0x1234567890AbcdEF1234567890aBcdef12345678;
