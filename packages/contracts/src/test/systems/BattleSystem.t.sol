// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import "forge-std/console.sol";
import { addressToEntity } from "solecs/utils.sol";

import { S_BattleSystem, ID as S_BattleSystemID } from "../../systems/S_BattleSystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";

import { BattleParticipant } from "../../types.sol";
import { LevelComponent, ID as LevelComponentID } from "../../components/LevelComponent.sol";
import { BattleAttackerComponent, ID as BattleAttackerComponentID } from "../../components/BattleAttackerComponent.sol";
import { BattleDefenderComponent, ID as BattleDefenderComponentID } from "../../components/BattleDefenderComponent.sol";
import { BattleResultComponent, ID as BattleResultComponentID, BattleResult } from "../../components/BattleResultComponent.sol";

import { BIGNUM } from "../../prototypes/Debug.sol";
//debug buildings
import "../../prototypes.sol";

contract S_BattleSystemTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ComponentDevSystem public componentDevSystem;
  S_BattleSystem public S_BattleSystem;
  LevelComponent public levelComponent;
  BattleResultComponent public battleResultComponent;

  function setUp() public override {
    super.setUp();

    //components
    battleResultComponent = BattleResultComponent(component(BattleResultComponentID));
    // init systems
    S_BattleSystem = S_BattleSystem(system(S_BattleSystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    spawn(alice);
    // init other
  }

  function testBattle() public {
    vm.startPrank(alice);
    uint256 battleEntity = LibEncode.hashKeyEntity(S_BattleSystemID, 0);

    //alice
    uint256 unitEntity = LibEncode.hashKeyEntity(DebugUnit, addressToEntity(alice));
    componentDevSystem.executeTyped(LevelComponentID, unitEntity, abi.encode(1));

    uint256[] memory unitTypes = new uint256[](1);
    unitTypes[0] = DebugUnit;
    uint32[] memory unitLevels = new uint32[](1);
    unitLevels[0] = 1;
    uint32[] memory unitCounts = new uint32[](1);
    unitCounts[0] = 100;
    BattleParticipant memory attacker = BattleParticipant(alice, unitTypes, unitLevels, unitCounts);
    componentDevSystem.executeTyped(
      BattleAttackerComponentID,
      battleEntity,
      abi.encode(attacker.playerAddress, attacker.unitTypes, attacker.unitLevels, attacker.unitCounts)
    );
    BattleParticipant memory getAttacker = BattleAttackerComponent(component(BattleAttackerComponentID)).getValue(
      battleEntity
    );
    console.log("attacker: %s", getAttacker.playerAddress);
    //bob
    unitEntity = LibEncode.hashKeyEntity(DebugUnit, addressToEntity(bob));
    componentDevSystem.executeTyped(LevelComponentID, unitEntity, abi.encode(1));

    unitTypes = new uint256[](1);
    unitTypes[0] = DebugUnit;
    unitLevels = new uint32[](1);
    unitLevels[0] = 1;
    unitCounts = new uint32[](1);
    unitCounts[0] = 100;
    BattleParticipant memory defender = BattleParticipant(bob, unitTypes, unitLevels, unitCounts);
    componentDevSystem.executeTyped(
      BattleDefenderComponentID,
      battleEntity,
      abi.encode(defender.playerAddress, defender.unitTypes, defender.unitLevels, defender.unitCounts)
    );

    S_BattleSystem.executeTyped(alice, battleEntity);
    require(battleResultComponent.has(battleEntity), "battle result not found");
    BattleResult memory result = battleResultComponent.getValue(battleEntity);
    for (uint256 i = 0; i < result.attackerUnitsLeft.length; i++) {
      console.log("attacker units left: %s", result.attackerUnitsLeft[i]);
    }
    for (uint256 i = 0; i < result.defenderUnitsLeft.length; i++) {
      console.log("defender units left: %s", result.defenderUnitsLeft[i]);
    }

    vm.stopPrank();
  }
}
