// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest, toString } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { EResource } from "src/Types.sol";

import { P_IsUtility, ClaimOffset, Position, PositionData, UnitCount, MaxResourceCount, Value_UnitProductionQueueData, P_UnitProdTypes, BuildingType, P_GameConfigData, P_GameConfig, Asteroid, Home, OwnedBy, Level, LastClaimedAt, P_Unit, P_UnitProdMultiplier, ResourceCount, ResourceCount, P_RequiredResources, P_RequiredResourcesData } from "codegen/index.sol";

contract LibColonyTest is PrimodiumTest {
  // todo: test getColonyShipsPlusAsteroids
  // todo: test buying a colony ship slot
  // todo: test primary asteroid counts
  // todo: test colony ship in training
  // todo: test claimed colony ship
  // todo: test self-transfer colony ship (from fleet to fleet of same player, asteroid to fleet of same player, etc.)
  // todo: test transfer colony ship, does it remove from old player and add to new player, does it revert when invalid
  // todo: test battle destroyed colony ship
  // todo: test capturing an asteroid and checking count (spent colony ship to gain asteroid)
  // todo: test wormhole asteroid counts
  // todo: test secondary asteroid counts
  // todo: test losing an asteroid when another player captures yours
  // todo: test losing an asteroid that was training a colony ship
  // todo: test installments
  // todo: test installment where one was already fulfilled previously and you don't add more
  // todo: what if the order of the installment resource types is different??? probably need to require the same order at the beginning of the function.
}
