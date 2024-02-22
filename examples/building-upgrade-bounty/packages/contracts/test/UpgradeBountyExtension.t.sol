// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

contract UpgradeBountyExtensionTest is Test {
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
  address worldAddress = vm.envAddress("WORLD_ADDRESS");

  function setUp() public virtual {
    console.log("ForkLivePrimodium is running.");
    uint256 forkId = vm.createSelectFork(vm.envString("PRIMODIUM_RPC_URL"));
  }
}
