// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { MirrorSubscriber } from "libraries/MirrorSubscriber.sol";
import { HookedValue, HookedValueTableId } from "codegen/tables/HookedValue.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { ALL } from "@latticexyz/store/src/storeHookTypes.sol";

import "test/PrimodiumTest.t.sol";

contract TestStoreHooks is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    MirrorSubscriber subscriber = new MirrorSubscriber(HookedValueTableId, world);
    console.log("Subscriber Created");
    world.grantAccess(OnHookChangedValueTableId, address(subscriber));
    world.registerStoreHook(HookedValueTableId, subscriber, ALL);

    //StoreCore.registerStoreHook(HookedValueTableId, subscriber, ALL);
    console.log("Subscriber Hooked");
  }

  function testStoreHooks(uint256 unitCount, uint256 defense) public returns (uint256) {
    vm.startPrank(creator);

    HookedValue.setValue(IStore(world), bytes32("test"), 1);
    console.log("Hooked value set");

    console.log(OnHookChangedValue.getValue(IStore(world), bytes32("test")));
    assertEq(
      HookedValue.getValue(IStore(world), bytes32("test")),
      OnHookChangedValue.getValue(IStore(world), bytes32("test")),
      "Hooked value should equal onHookChangedValue"
    );
  }
}
