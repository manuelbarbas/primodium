// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { console } from "forge-std/console.sol";

import { P_RequiredResourcesData, P_RequiredResources, P_EnumToPrototype, P_IsUtility, UnitCount, OwnedBy, ProductionRate, LastClaimedAt, Home, PrimodiumTest, entityToAddress, MarketplaceOrder, P_GameConfig, P_GameConfig2, addressToEntity, EResource, ResourceCount, MaxResourceCount, LibProduction } from "test/PrimodiumTest.t.sol";
import { EBuilding } from "src/Types.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { ROOT_NAMESPACE, ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { LibResource } from "src/libraries/LibResource.sol";
import { LibStorage } from "src/libraries/LibStorage.sol";
import { LibUnit } from "src/libraries/LibUnit.sol";
import { EOrderType, EUnit } from "src/Types.sol";
import { UnitKey } from "src/Keys.sol";

// NOTE: core functionality is tested in LibReinforceTest.t.sol
contract MarketplaceSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 playerHome = "home";
  bytes32 buyer;
  bytes32 buyerHome = "buyerHome";

  EUnit unit = EUnit(1);
  bytes32 unitPrototype = "unitPrototype";

  IERC20Mintable wETH;

  function setUp() public override {
    super.setUp();
    buyer = addressToEntity(alice);
    wETH = IERC20Mintable(P_GameConfig2.getWETHAddress());
    player = addressToEntity(creator);
    vm.startPrank(creator);
    buyer = addressToEntity(alice);
    Home.set(player, playerHome);
    Home.set(buyer, buyerHome);
    OwnedBy.set(playerHome, player);
    LibProduction.increaseResourceProduction(playerHome, EResource.U_Orders, 1);

    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);
  }

  function testAddOrder() public returns (bytes32) {
    ResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    bytes32 orderId = world.addOrder(EOrderType.Resource, uint8(EResource.Iron), 100, 100);
    assertEq(MarketplaceOrder.getSeller(orderId), player);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron));
    assertEq(MarketplaceOrder.getCount(orderId), 100);
    assertEq(MarketplaceOrder.getPrice(orderId), 100);
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 0);
    return orderId;
  }

  function testAddUnitOrderTakeOrder() public {
    wETH.transfer(alice, 10000);
    P_IsUtility.set(uint8(Iron), true);
    uint8[] memory p_requiredresources_resources_level_0 = new uint8[](1);
    p_requiredresources_resources_level_0[0] = uint8(Iron);
    uint256[] memory p_requiredresources_amounts_level_0 = new uint256[](1);
    p_requiredresources_amounts_level_0[0] = 1;

    P_RequiredResources.set(
      unitPrototype,
      0,
      P_RequiredResourcesData(p_requiredresources_resources_level_0, p_requiredresources_amounts_level_0)
    );
    LibProduction.increaseResourceProduction(buyerHome, EResource.Iron, 100);
    LibProduction.increaseResourceProduction(playerHome, EResource.Iron, 100);

    LibResource.spendUnitRequiredResources(playerHome, unitPrototype, 100);
    LibUnit.increaseUnitCount(playerHome, unitPrototype, 100);
    bytes32 orderId = world.addOrder(EOrderType.Unit, uint8(unit), 100, 100);
    assertEq(MarketplaceOrder.getSeller(orderId), player, "seller wrong");
    assertEq(MarketplaceOrder.getResource(orderId), uint8(unit), "resource wrong");
    assertEq(MarketplaceOrder.getCount(orderId), 100, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 100, "price wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 0, "order count wrong");

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 100);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(UnitCount.get(Home.get(player), unitPrototype), 0, "seller unit count wrong");
    assertEq(UnitCount.get(Home.get(buyer), unitPrototype), 100, "buyer unit count wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 100, "seller utility after take order wrong");
    assertEq(ResourceCount.get(Home.get(buyer), uint8(EResource.Iron)), 0, "buyer utility after take order wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testAddOrderClaimResources() public returns (bytes32) {
    LibStorage.setMaxStorage(playerHome, uint8(EResource.Iron), 100);

    ProductionRate.set(playerHome, uint8(EResource.Iron), 100);
    LastClaimedAt.set(playerHome, block.timestamp);
    vm.warp(block.timestamp + 1);
    assertEq(MaxResourceCount.get(playerHome, uint8(EResource.Iron)), 100, "before add order max iron not 100");
    assertEq(ResourceCount.get(playerHome, uint8(EResource.Iron)), 100, "before add order iron not 100");
    switchPrank(creator);
    bytes32 orderId = world.addOrder(EOrderType.Resource, uint8(EResource.Iron), 100, 100);
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 100, "after add order iron not 100");
    assertEq(MarketplaceOrder.getSeller(orderId), player);
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron));
    assertEq(MarketplaceOrder.getCount(orderId), 100);
    assertEq(MarketplaceOrder.getPrice(orderId), 100);
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 0);
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
    testAddOrder();
    ResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    vm.expectRevert("[MarketplaceSystem] Max orders reached");
    world.addOrder(EOrderType.Resource, uint8(EResource.Iron), 1, 49);
  }

  function testCancelOrder() public {
    bytes32 orderId = testAddOrder();
    world.cancelOrder(orderId);
    assertEq(MarketplaceOrder.getCount(orderId), 0);
    assertEq(MarketplaceOrder.getPrice(orderId), 0);
    assertEq(MarketplaceOrder.getResource(orderId), 0);
    assertEq(MarketplaceOrder.getSeller(orderId), 0);
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 1);
  }

  function testTakeOrder() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 100);

    MaxResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    ResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 100);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(Home.get(buyer), uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testTakeOrderClaim() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 100);

    MaxResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    ProductionRate.set(Home.get(player), uint8(EResource.Iron), 100);
    LastClaimedAt.set(Home.get(player), block.timestamp - 1);
    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 100);

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(Home.get(buyer), uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testTakePartialOrder() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 100);

    MaxResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    ResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);

    uint256 prevSellerBalance = wETH.balanceOf(creator);
    uint256 prevBuyerBalance = wETH.balanceOf(alice);

    switchPrank(alice);
    world.takeOrder(orderId, 50);

    assertEq(MarketplaceOrder.getCount(orderId), 50, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 100, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), uint8(EResource.Iron), "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), player, "seller wrong");

    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 0, "seller order count wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 50, "seller resource count wrong");
    assertEq(ResourceCount.get(Home.get(buyer), uint8(EResource.Iron)), 50, "buyer resource count wrong");

    uint256 cost = 100 * 50;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }

  function testTakeOwnOrder() public {
    bytes32 orderId = testAddOrder();
    ResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 0);
    MaxResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 100);
    vm.expectRevert("[MarketplaceSystem] Cannot take your own order");
    world.takeOrder(orderId, 100 * 100);
  }

  function testTakeOrderBulk() public {
    bytes32 orderId = testAddOrder();
    wETH.transfer(alice, 10000);

    MaxResourceCount.set(Home.get(buyer), uint8(EResource.Iron), 100);

    MaxResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);
    ResourceCount.set(Home.get(player), uint8(EResource.Iron), 100);

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

    assertEq(MarketplaceOrder.getCount(orderId), 0, "count wrong");
    assertEq(MarketplaceOrder.getPrice(orderId), 0, "price wrong");
    assertEq(MarketplaceOrder.getResource(orderId), 0, "resource wrong");
    assertEq(MarketplaceOrder.getSeller(orderId), 0, "seller wrong");

    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.U_Orders)), 1, "seller order count wrong");
    assertEq(ResourceCount.get(Home.get(player), uint8(EResource.Iron)), 0, "seller resource count wrong");
    assertEq(ResourceCount.get(Home.get(buyer), uint8(EResource.Iron)), 100, "buyer resource count wrong");

    uint256 cost = 100 * 100;
    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    assertEq(wETH.balanceOf(creator), prevSellerBalance + cost, "seller balance wrong");
    assertEq(wETH.balanceOf(alice), prevBuyerBalance - cost - tax, "buyer balance wrong");
  }
}
