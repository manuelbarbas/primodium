// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity } from "src/utils.sol";
import { ResourceCount, MarketplaceOrder, OrderCount, MarketplaceOrderData, P_GameConfig } from "codegen/index.sol";
import { LibResource, LibStorage } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { EResource } from "src/Types.sol";

contract MarketplaceSystem is PrimodiumSystem {
  modifier onlySeller(bytes32 orderId) {
    require(
      MarketplaceOrder.getSeller(orderId) == addressToEntity(_msgSender()),
      "[MarketplaceSystem] you don't control this order"
    );
    _;
  }

  function addOrder(
    EResource resource,
    uint256 count,
    uint256 price
  ) public returns (bytes32 orderId) {
    bytes32 playerEntity = addressToEntity(_msgSender());

    uint256 orderCount = OrderCount.get(playerEntity);
    uint256 maxOrders = P_GameConfig.getMaxOrders();
    require(orderCount < maxOrders, "[MarketplaceSystem] max orders reached");

    orderId = keccak256(abi.encodePacked(resource, count, block.timestamp, msg.sender));

    require(
      count > 0 && count <= ResourceCount.get(playerEntity, uint8(resource)),
      "[MarketplaceSystem] invalid count"
    );

    MarketplaceOrder.set(
      orderId,
      MarketplaceOrderData({ seller: playerEntity, resource: uint8(resource), count: count, price: price })
    );
    OrderCount.set(playerEntity, orderCount + 1);
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
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    if (count == 0) return cancelOrder(orderId);
    _updateOrderCount(playerEntity, orderId, count);
    order.resource = uint8(resource);
    order.price = price;
    MarketplaceOrder.set(orderId, order);
  }

  function updateOrderCount(bytes32 orderId, uint256 count) public onlySeller(orderId) {
    _updateOrderCount(addressToEntity(_msgSender()), orderId, count);
  }

  function _updateOrderCount(
    bytes32 playerEntity,
    bytes32 orderId,
    uint256 count
  ) internal {
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    if (count == 0) return cancelOrder(orderId);
    uint256 playerBalance = ResourceCount.get(playerEntity, order.resource);

    require(count >= playerBalance, "[MarketplaceSystem] not enough resource in balance");

    MarketplaceOrder.setCount(orderId, count);
  }

  function updateOrderresource(bytes32 orderId, EResource resource) public onlySeller(orderId) {
    MarketplaceOrder.setResource(orderId, uint8(resource));
  }

  function updateOrderPrice(bytes32 orderId, uint256 price) public onlySeller(orderId) {
    MarketplaceOrder.setPrice(orderId, price);
  }

  function takeOrder(bytes32 orderId, uint256 countBought) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    require(order.seller != playerEntity, "[MarketplaceSystem] cannot take your own order");
    require(order.count >= countBought, "[MarketplaceSystem] not enough resource in order");

    if (countBought == 0) return;

    uint256 cost = countBought * order.price;
    uint256 tax = (P_GameConfig.getTaxRate() * cost) / 1000;
    cost = cost - tax;

    // transfer out resource
    require(
      ResourceCount.get(order.seller, order.resource) >= countBought,
      "[MarketplaceSystem] seller doesn't have enough resources"
    );
    LibStorage.decreaseStoredResource(order.seller, order.resource, countBought);
    require(
      LibResource.getResourceCountAvailable(playerEntity, order.resource) >= countBought,
      "[MarketplaceSystem] buyer doesn't have enough space"
    );
    LibStorage.increaseStoredResource(playerEntity, order.resource, countBought);

    if (countBought == order.count) {
      _removeOrder(orderId);
    } else {
      _updateOrderCount(order.seller, orderId, order.count - countBought);
    }
    (bool sent, bytes memory data) = _msgSender().call{ value: cost }("");
    require(sent, "Failed to send Ether");
    (sent, data) = IWorld(_world()).creator().call{ value: tax }("");
    require(sent, "Failed to send tax");
  }

  function takeOrderBulk(bytes32[] memory orderId, uint256[] memory count) public {
    require(orderId.length == count.length, "[MarketplaceSystem] invalid input");
    for (uint256 i = 0; i < orderId.length; i++) {
      takeOrder(orderId[i], count[i]);
    }
  }

  function _removeOrder(bytes32 orderId) internal {
    bytes32 seller = MarketplaceOrder.getSeller(orderId);
    MarketplaceOrder.deleteRecord(orderId);
    OrderCount.set(seller, OrderCount.get(seller) - 1);
  }

  receive() external payable {}
}
