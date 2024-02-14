// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import { IBaseWorld } from "@latticexyz/world-modules/src/interfaces/IBaseWorld.sol"; // get definitions common to all World contracts

import { AccessManagementSystem } from "@latticexyz/world/src/modules/core/implementations/AccessManagementSystem.sol";

// Create resource identifiers (for the namespace and system)
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// For getting world and table data
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { PositionData } from "../src/codegen/index.sol";

contract UpgrBounSystemAccess is Script {
  function run() external {
    address deployerAddress = address(uint160(vm.envUint("ADDRESS_ALICE")));
    console.log("Alice address: %x", deployerAddress);
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ALICE");
    console.log("Alice private key: %x", deployerPrivateKey);
    address delegateeAddress = address(uint160(vm.envUint("ADDRESS_BOB")));
    console.log("Bob address: %x", delegateeAddress);
    uint256 delegateePrivateKey = vm.envUint("PRIVATE_KEY_BOB");
    console.log("Bob private key: %x", delegateePrivateKey);
    address worldAddress = vm.envAddress("WORLD_ADDRESS");

    // Prep encoding the Ids before executing anything
    IWorld world = IWorld(worldAddress);
    AccessManagementSystem worldAccess = AccessManagementSystem(worldAddress);
    ResourceId upgrBounSystemResource = WorldResourceIdLib.encode(RESOURCE_SYSTEM, "upgradeBounty", "UpgrBounSystem");
    // Visual debug check
    console.log("System ID:    %x", uint256(ResourceId.unwrap(upgrBounSystemResource)));

    // Alice uses her namespace admin rights to give Bob system access control
    vm.startBroadcast(deployerPrivateKey);
    worldAccess.grantAccess(upgrBounSystemResource, delegateeAddress);
    vm.stopBroadcast();
    console.log("Alice granted Bob access to UpgrBounSystem.");

    // Establish the bounty coordinates.
    PositionData memory bountyCoord = PositionData({
      x: 20,
      y: 15,
      parent: 0x7ceb58780fb137bb02223b79c88bc6404f736f8bb4d1f0895d9884122804fb73
    });
    uint256 oneEther = 1 ether;

    // Alice deposits a bounty at a coordinate
    vm.startBroadcast(deployerPrivateKey);
    uint256 bountyValue = world.upgradeBounty_UpgrBounSystem_depositBounty{ value: oneEther }(bountyCoord);
    vm.stopBroadcast();
    console.log("Alice set a bounty for %d wei.", bountyValue);

    // Alice withdraws a bounty at the same coordinate
    vm.startBroadcast(deployerPrivateKey);
    bountyValue = world.upgradeBounty_UpgrBounSystem_withdrawBounty(bountyCoord);
    vm.stopBroadcast();
    console.log("Alice withdrew a %d wei bounty.", bountyValue);

    // Alice deposits a bounty again, at a coordinate
    vm.startBroadcast(deployerPrivateKey);
    bountyValue = world.upgradeBounty_UpgrBounSystem_depositBounty{ value: oneEther }(bountyCoord);
    vm.stopBroadcast();
    console.log("Alice set another bounty for %d wei.", bountyValue);

    /*
    // quick test: does anyone have access to the system?
    uint256 hostilePrivateKey = vm.envUint("PRIVATE_KEY_MALLORY");
    console.log("Mallory private key: %x", hostilePrivateKey);
    
    vm.startBroadcast(hostilePrivateKey);
    bytes memory newBuildingEntity = world.upgradeBounty_UpgrBounSystem_upgradeForBounty(deployerAddress, bountyCoord);
    vm.stopBroadcast();
    */

    // Bob upgrades Alice's building. Note Alice needs to have the requisite upgrade resources for it to succeed.
    vm.startBroadcast(delegateePrivateKey);
    bytes memory newBuildingEntity = world.upgradeBounty_UpgrBounSystem_upgradeForBounty(deployerAddress, bountyCoord);
    vm.stopBroadcast();
  }
}
