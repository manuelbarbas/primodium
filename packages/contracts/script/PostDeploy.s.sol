// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { setupHooks } from "script/SetupHooks.sol";
import { createPrototypes } from "codegen/Prototypes.sol";
import { createTerrain } from "codegen/scripts/CreateTerrain.sol";
import { P_GameConfig, P_GameConfig2 } from "codegen/index.sol";

import { PuppetModule } from "@latticexyz/world-modules/src/modules/puppet/PuppetModule.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { registerERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/registerERC20.sol";
import { ERC20MetadataData } from "@latticexyz/world-modules/src/modules/erc20-puppet/tables/ERC20Metadata.sol";

uint256 constant WETH_SUPPLY = 100_000_000 ether; // tokens

contract PostDeploy is Script {
  function run(address worldAddress) external {
    // Load the private key from the `PRIVATE_KEY` environment variable (in .env)
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address admin = vm.addr(deployerPrivateKey);

    IWorld world = IWorld(worldAddress);
    address creator = world.creator();
    vm.startBroadcast(deployerPrivateKey);
    StoreSwitch.setStoreAddress(worldAddress);
    uint256 newValue = world.increment();

    createPrototypes(world);
    console.log("Prototypes created");
    createTerrain(world);
    console.log("Terrain created");
    setupHooks(world);

    // this must be set after the prototypes or else it will be overwritten

    world.installModule(new PuppetModule(), new bytes(0));
    IERC20Mintable token = registerERC20(
      world,
      "wETH",
      ERC20MetadataData({ decimals: 18, name: "wETH", symbol: unicode"💎" })
    );

    P_GameConfig2.setWETHAddress(address(token));
    P_GameConfig.setAdmin(admin);
    token.mint(admin, WETH_SUPPLY);

    vm.stopBroadcast();
  }
}
