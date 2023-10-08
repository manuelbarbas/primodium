// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { createPrototypes } from "codegen/scripts/CreatePrototypes.sol";
import { createTerrain } from "codegen/scripts/CreateTerrain.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { MirrorSubscriber } from "libraries/MirrorSubscriber.sol";
import { HookedValue, HookedValueTableId } from "codegen/tables/HookedValue.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { Children, ChildrenTableId } from "codegen/tables/Children.sol";
import { OwnedBy, OwnedByTableId } from "codegen/tables/OwnedBy.sol";
import { Position, PositionTableId, PositionData } from "codegen/tables/Position.sol";
import { OnBuild_PlaceOnTile } from "libraries/hooks/OnBuild_PlaceOnTile.sol";
import { BuildOrder, BuildOrderTableId, BuildOrderData } from "codegen/tables/BuildOrder.sol";

import { ALL } from "@latticexyz/world/src/systemHookTypes.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    IWorld world = IWorld(worldAddress);
    // Start broadcasting transactions from the deployer account
    vm.startBroadcast(deployerPrivateKey);

    uint256 newValue = world.increment();
    console.log("Increment via IWorld:", newValue);

    createPrototypes(world);
    console.log("Prototypes created");
    createTerrain(world);
    console.log("Terrain created");

    // OnBuild_PlaceOnTile placeOnTile = new OnBuild_PlaceOnTile();
    // world.grantAccess(ChildrenTableId, address(placeOnTile));
    // world.grantAccess(OwnedByTableId, address(placeOnTile));
    // world.grantAccess(PositionTableId, address(placeOnTile));
    // world.registerSystemHook(getSystemResourceId("BuildSystem"), placeOnTile, ALL);

    vm.stopBroadcast();
  }
}
