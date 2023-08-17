// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import "forge-std/console.sol";
import { addressToEntity } from "solecs/utils.sol";
import { S_RaidSystem, ID as S_RaidSystemID } from "../../systems/S_RaidSystem.sol";
import { S_BattleSystem, ID as S_BattleSystemID } from "../../systems/S_BattleSystem.sol";
import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { BuildSystem as BuildSystem } from "../../systems/BuildSystem.sol";

import { BattleParticipant } from "../../types.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
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
  S_RaidSystem public raidSystem;
  S_BattleSystem public battleSystem;
  BuildSystem public buildSystem;
  LevelComponent public levelComponent;
  BattleResultComponent public battleResultComponent;
  ItemComponent public itemComponent;

  function setUp() public override {
    super.setUp();

    //components
    battleResultComponent = BattleResultComponent(component(BattleResultComponentID));
    itemComponent = ItemComponent(component(ItemComponentID));
    // init systems
    buildSystem = BuildSystem(system(BuildSystemID));
    battleSystem = S_BattleSystem(system(S_BattleSystemID));
    raidSystem = S_RaidSystem(system(S_RaidSystemID));
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
    spawn(alice);
    spawn(bob);
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

    battleSystem.executeTyped(alice, battleEntity);
    assertTrue(battleResultComponent.has(battleEntity), "battle result not found");
    BattleResult memory result = battleResultComponent.getValue(battleEntity);
    for (uint256 i = 0; i < result.attackerUnitsLeft.length; i++) {
      console.log("attacker units left: %s", result.attackerUnitsLeft[i]);
    }
    for (uint256 i = 0; i < result.defenderUnitsLeft.length; i++) {
      console.log("defender units left: %s", result.defenderUnitsLeft[i]);
    }

    vm.stopPrank();
  }

  function testBattleRaid() public {
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

    componentDevSystem.executeTyped(
      ItemComponentID,
      LibEncode.hashKeyEntity(IronID, addressToEntity(bob)),
      abi.encode(2000)
    );

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

    battleSystem.executeTyped(alice, battleEntity);
    assertTrue(battleResultComponent.has(battleEntity), "battle result not found");

    raidSystem.executeTyped(alice, battleEntity);

    assertTrue(itemComponent.has(LibEncode.hashKeyEntity(IronID, addressToEntity(alice))), "alice has no iron");
    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(IronID, addressToEntity(alice))),
      1000,
      "alice should have 1000 iron"
    );

    assertEq(
      itemComponent.getValue(LibEncode.hashKeyEntity(IronID, addressToEntity(bob))),
      1000,
      "bob should have 1000 iron"
    );

    vm.stopPrank();
  }
}
