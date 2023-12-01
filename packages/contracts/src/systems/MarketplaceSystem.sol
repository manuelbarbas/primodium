// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity } from "src/utils.sol";

import { Home, ResourceCount, MarketplaceOrder, MaxResourceCount, MarketplaceOrderData, P_GameConfig, P_GameConfig2 } from "codegen/index.sol";
import { LibResource, LibStorage } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { transferToken } from "src/libraries/transferToken.sol";

import { EResource } from "src/Types.sol";

contract MarketplaceSystem is PrimodiumSystem {
  modifier onlySeller(bytes32 orderId) {
    require(
      MarketplaceOrder.getSeller(orderId) == addressToEntity(_msgSender()),
      "[MarketplaceSystem] You don't control this order"
    );
    _;
  }

  function addOrder(
    EResource resource,
    uint256 count,
    uint256 price
  ) public returns (bytes32 orderId) {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    LibResource.claimAllResources(homeAsteroid);
    uint256 orderCount = ResourceCount.get(homeAsteroid, uint8(EResource.U_Orders));
    require(orderCount > 0, "[MarketplaceSystem] Max orders reached");

    orderId = keccak256(abi.encodePacked(resource, count, block.timestamp, msg.sender));

    require(
      count > 0 && count <= ResourceCount.get(homeAsteroid, uint8(resource)),
      "[MarketplaceSystem] Invalid count"
    );

    MarketplaceOrder.set(
      orderId,
      MarketplaceOrderData({ seller: playerEntity, resource: uint8(resource), count: count, price: price })
    );
    LibStorage.decreaseStoredResource(homeAsteroid, uint8(EResource.U_Orders), 1);
  }

  function cancelOrder(bytes32 orderId) public onlySeller(orderId) {
    _removeOrder(orderId);
  }

  function updateOrder(
    bytes32 orderId,
    EResource resource,
    uint256 count,
    uint256 price
  ) public onlySeller(orderId) {
    bytes32 playerEntity = addressToEntity(_msgSender());
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    LibResource.claimAllResources(homeAsteroid);

    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    if (count == 0) return cancelOrder(orderId);
    order.resource = uint8(resource);
    order.price = price;
    MarketplaceOrder.set(orderId, order);
    _updateOrderCount(orderId, count);
  }

  function updateOrderCount(bytes32 orderId, uint256 count) public onlySeller(orderId) {
    _updateOrderCount(orderId, count);
  }

  function _updateOrderCount(bytes32 orderId, uint256 count) internal {
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    if (count == 0) return cancelOrder(orderId);
    bytes32 homeAsteroid = Home.getAsteroid(order.seller);
    uint256 playerBalance = ResourceCount.get(homeAsteroid, order.resource);

    require(count <= playerBalance, "[MarketplaceSystem] Not enough resource in balance");

    MarketplaceOrder.setCount(orderId, count);
  }

  function updateOrderResource(bytes32 orderId, EResource resource) public onlySeller(orderId) {
    MarketplaceOrder.setResource(orderId, uint8(resource));
  }

  function updateOrderPrice(bytes32 orderId, uint256 price) public onlySeller(orderId) {
    MarketplaceOrder.setPrice(orderId, price);
  }

  function takeOrder(bytes32 orderId, uint256 countBought) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    if (countBought == 0) revert("[MarketplaceSystem] Invalid count");
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    require(order.seller != playerEntity, "[MarketplaceSystem] Cannot take your own order");
    require(order.count >= countBought, "[MarketplaceSystem] Not enough resource in order");
    bytes32 sellerHome = Home.getAsteroid(order.seller);
    bytes32 buyerHome = Home.getAsteroid(playerEntity);
    LibResource.claimAllResources(sellerHome);
    require(
      ResourceCount.get(sellerHome, order.resource) >= countBought,
      "[MarketplaceSystem] Seller doesn't have enough resources"
    );

    require(
      LibResource.getResourceCountAvailable(buyerHome, order.resource) >= countBought,
      "[MarketplaceSystem] Buyer doesn't have enough space"
    );

    IERC20Mintable wETH = IERC20Mintable(P_GameConfig2.getWETHAddress());

    uint256 cost = countBought * order.price;
    require(cost <= wETH.balanceOf(_msgSender()), "[MarketplaceSystem] Not enough weth");

    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    transferToken(_world(), entityToAddress(order.seller), cost);
    transferToken(_world(), address(1), tax);

    LibStorage.decreaseStoredResource(sellerHome, order.resource, countBought);
    LibStorage.increaseStoredResource(buyerHome, order.resource, countBought);

    if (countBought == order.count) {
      _removeOrder(orderId);
    } else {
      _updateOrderCount(orderId, order.count - countBought);
    }
  }

  function takeOrderBulk(bytes32[] memory orderId, uint256[] memory count) public {
    require(orderId.length == count.length, "[MarketplaceSystem] Invalid input");
    for (uint256 i = 0; i < orderId.length; i++) {
      takeOrder(orderId[i], count[i]);
    }
  }

  function _removeOrder(bytes32 orderId) internal {
    bytes32 seller = MarketplaceOrder.getSeller(orderId);
    bytes32 homeAsteroid = Home.getAsteroid(seller);
    MarketplaceOrder.deleteRecord(orderId);
    LibStorage.increaseStoredResource(homeAsteroid, uint8(EResource.U_Orders), 1);
  }
}
