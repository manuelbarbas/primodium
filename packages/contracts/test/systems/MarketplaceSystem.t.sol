// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";

import { PrimodiumTest, entityToAddress, MarketplaceOrder, P_GameConfig, addressToEntity, EResource, ResourceCount, MaxResourceCount, LibProduction } from "test/PrimodiumTest.t.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { ROOT_NAMESPACE, ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";

// NOTE: core functionality is tested in LibReinforceTest.t.sol
contract MarketplaceSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 buyer;
  IERC20Mintable wETH;

  function setUp() public override {
    super.setUp();
    buyer = addressToEntity(alice);
    wETH = IERC20Mintable(P_GameConfig.getWETHAddress());
    player = addressToEntity(creator);
    vm.startPrank(creator);
    buyer = addressToEntity(alice);

    LibProduction.increaseResourceProduction(player, EResource.U_Orders, 1);
  }

  function testAddOrder() public returns (bytes32) {
    ResourceCount.set(player, uint8(EResource.Iron), 100);
    bytes32 orderId = world.addOrder(EResource.Iron, 100, 100);
    assertEq(MarketplaceOrder.getSeller(orderId), player);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron));
    assertEq(MarketplaceOrder.getCount(orderId), 100);
    assertEq(MarketplaceOrder.getPrice(orderId), 100);
    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 0);
    return orderId;
  }

  function testUpdateOrderCount() public {
    bytes32 orderId = testAddOrder();
    world.updateOrderCount(orderId, 49);
    assertEq(MarketplaceOrder.getCount(orderId), 49);
  }

  function testUpdateOrderResource() public {
    bytes32 orderId = testAddOrder();
    world.updateOrderResource(orderId, EResource.Copper);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Copper));
  }

  function testUpdateOrderPrice() public {
    bytes32 orderId = testAddOrder();
    world.updateOrderPrice(orderId, 50);
    assertEq(MarketplaceOrder.getPrice(orderId), 50);
  }

  function testUpdateOrder() public returns (bytes32 orderId) {
    orderId = testAddOrder();
    world.updateOrder(orderId, EResource.Iron, 49, 51);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron));
    assertEq(MarketplaceOrder.getCount(orderId), 49);
    assertEq(MarketplaceOrder.getPrice(orderId), 51);
  }

  function testOnlySeller() public {
    bytes32 orderId = testAddOrder();
    assertEq(MarketplaceOrder.getSeller(orderId), player);
    switchPrank(alice);
    vm.expectRevert("[MarketplaceSystem] You don't control this order");
    world.updateOrder(orderId, EResource.Copper, 49, 51);
  }

  function testAddMaxOrderReached() public {
    bytes32 orderId = testAddOrder();
    ResourceCount.set(player, uint8(EResource.Iron), 100);
    vm.expectRevert("[MarketplaceSystem] Max orders reached");
    world.addOrder(EResource.Iron, 1, 49);
  }

  function testCancelOrder() public {
    bytes32 orderId = testAddOrder();
    world.cancelOrder(orderId);
    assertEq(MarketplaceOrder.getCount(orderId), 0);
    assertEq(MarketplaceOrder.getPrice(orderId), 0);
    assertEq(MarketplaceOrder.getResource(orderId), 0);
    assertEq(MarketplaceOrder.getSeller(orderId), 0);
    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 1);
  }

  function testTakeOrder() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);

    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    ResourceCount.set(player, uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 100);
    uint256 postSellerBalance = wETH.balanceOf(creator);
    uint256 postBuyerBalance = wETH.balanceOf(alice);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(buyer, uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testTakePartialOrder() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);

    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    ResourceCount.set(player, uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 50);
    uint256 postSellerBalance = wETH.balanceOf(creator);
    uint256 postBuyerBalance = wETH.balanceOf(alice);

    assertEq(MarketplaceOrder.getCount(orderId), 50, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 100, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron), "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), player, "seller wrong");

    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 0, "seller order count wrong");
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 50, "seller resource count wrong");
    assertEq(ResourceCount.get(buyer, uint8(EResource.Iron)), 50, "buyer resource count wrong");

    uint256 cost = 100 * 50;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testTakeOwnOrder() public {
    bytes32 orderId = testAddOrder();
    ResourceCount.set(buyer, uint8(EResource.Iron), 0);
    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);
    vm.expectRevert("[MarketplaceSystem] Cannot take your own order");
    world.takeOrder(orderId, 100 * 100);
  }

  function testTakeOrderBulk() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);

    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    ResourceCount.set(player, uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    bytes32[] memory orders = new bytes32[](2);
    uint256[] memory counts = new uint256[](2);
    orders[0] = orderId;
    orders[1] = orderId;
    counts[0] = 50;
    counts[1] = 50;
    world.takeOrderBulk(orders, counts);
    uint256 postSellerBalance = wETH.balanceOf(creator);
    uint256 postBuyerBalance = wETH.balanceOf(alice);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(buyer, uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }
}
