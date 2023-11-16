// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";

import { PrimodiumTest, Balance, entityToAddress, MarketplaceOrder, P_GameConfig, addressToEntity, EResource, ResourceCount, MaxResourceCount } from "test/PrimodiumTest.t.sol";

// NOTE: core functionality is tested in LibReinforceTest.t.sol
contract MarketplaceSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 buyer;

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    buyer = addressToEntity(alice);
    vm.deal(alice, 100 ether);

    MaxResourceCount.set(player, uint8(EResource.U_Orders), 1);
  }

  function testAddOrder() public returns (bytes32) {
    ResourceCount.set(player, uint8(EResource.Iron), 100);
    bytes32 orderId = world.addOrder(EResource.Iron, 100, 100);
    assertEq(MarketplaceOrder.getSeller(orderId), player);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron));
    assertEq(MarketplaceOrder.getCount(orderId), 100);
    assertEq(MarketplaceOrder.getPrice(orderId), 100);
    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 1);
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
    vm.expectRevert("[MarketplaceSystem] you don't control this order");
    world.updateOrder(orderId, EResource.Copper, 49, 51);
  }

  function testAddMaxOrderReached() public {
    bytes32 orderId = testAddOrder();
    ResourceCount.set(player, uint8(EResource.Iron), 100);
    vm.expectRevert("[MarketplaceSystem] max orders reached");
    world.addOrder(EResource.Iron, 1, 49);
  }

  function testCancelOrder() public {
    bytes32 orderId = testAddOrder();
    world.cancelOrder(orderId);
    assertEq(MarketplaceOrder.getCount(orderId), 0);
    assertEq(MarketplaceOrder.getPrice(orderId), 0);
    assertEq(MarketplaceOrder.getResource(orderId), 0);
    assertEq(MarketplaceOrder.getSeller(orderId), 0);
    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 0);
  }

  function testTakeOrder() public {
    bytes32 orderId = testAddOrder();
    Balance.set(buyer, 10000);

    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);

    MaxResourceCount.set(player, uint8(EResource.Iron), 100);
    ResourceCount.set(player, uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = Balance.get(player);
    uint256 prevBuyerBalance = Balance.get(buyer);

    switchPrank(alice);
    world.takeOrder(orderId, 100);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(player, uint8(EResource.U_Orders)), 0, "seller order count wrong");
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(buyer, uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getBurn() * cost) / 1000;
    cost = cost - tax;

    assertEq(Balance.get(player), cost, "seller balance wrong");
    assertEq(Balance.get(buyer), 0);
  }

  function testTakeOwnOrder() public {
    bytes32 orderId = testAddOrder();
    ResourceCount.set(buyer, uint8(EResource.Iron), 0);
    MaxResourceCount.set(buyer, uint8(EResource.Iron), 100);
    uint256 prevSellerBalance = entityToAddress(player).balance;
    uint256 prevBuyerBalance = entityToAddress(player).balance;
    vm.expectRevert("[MarketplaceSystem] cannot take your own order");
    world.takeOrder(orderId, 100 * 100);
  }
}
