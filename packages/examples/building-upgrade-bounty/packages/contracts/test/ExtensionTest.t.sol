// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceAccess, NamespaceOwner } from "@latticexyz/world/src/codegen/index.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";

import "codegen/world/IWorld.sol";
import "codegen/index.sol";
import "src/systems/UpgrBounSystem.sol";

contract ExtensionTest is MudTest {
  IWorld public world;
  uint256 userNonce = 0;
  uint256 MAX_INT = 2 ** 256 - 1;

  address creator;
  address payable alice;
  address payable bob;
  address payable mallory;

  function setUp() public virtual override {
    worldAddress = vm.envAddress("WORLD_ADDRESS");
    StoreSwitch.setStoreAddress(worldAddress);
    world = IWorld(worldAddress);
    creator = world.creator();

    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_ADMIN");

    vm.startPrank(creator);
    ResourceAccess.set(ROOT_NAMESPACE_ID, creator, true);
    NamespaceOwner.set(ROOT_NAMESPACE_ID, creator);
    vm.stopPrank();

    alice = getUser();
    bob = getUser();
    mallory = getUser();

    deployAndRegisterExtension();
  }

  function getUser() internal returns (address payable) {
    address payable user = payable(address(uint160(uint256(keccak256(abi.encodePacked(userNonce++))))));
    vm.deal(user, 100 ether);
    return user;
  }

  modifier prank(address prankster) {
    vm.startPrank(prankster);
    _;
    vm.stopPrank();
  }

  function switchPrank(address prankster) internal {
    vm.stopPrank();
    vm.startPrank(prankster);
  }

  function deployAndRegisterExtension() internal {
    // take from the UpgradeBountyExtension.s.sol
  }
}
