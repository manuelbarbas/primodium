// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { P_EnumToPrototype, UnitCount, Home, ResourceCount, MarketplaceOrder, MaxResourceCount, MarketplaceOrderData, P_GameConfig, P_GameConfig2 } from "codegen/index.sol";
import { LibResource, LibStorage, LibUnit } from "codegen/Libraries.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { IERC20Mintable } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20Mintable.sol";
import { transferToken } from "src/libraries/transferToken.sol";
import { UnitKey } from "src/Keys.sol";
import { EResource, EUnit, EOrderType } from "src/Types.sol";

contract MarketplaceSystem is PrimodiumSystem {
  modifier onlySeller(bytes32 orderId) {
    require(MarketplaceOrder.getSeller(orderId) == _player(true), "[MarketplaceSystem] You don't control this order");
    _;
  }

  function addResourceOrder(
    EResource resource,
    uint256 count,
    uint256 price
  ) public returns (bytes32 orderId) {
    bytes32 playerEntity = _player(true);
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    uint256 orderCount = ResourceCount.get(homeAsteroid, uint8(EResource.U_Orders));
    require(orderCount > 0, "[MarketplaceSystem] Max orders reached");

    orderId = keccak256(abi.encodePacked(resource, count, block.timestamp, msg.sender));

    MarketplaceOrder.set(
      orderId,
      MarketplaceOrderData({
        seller: playerEntity,
        orderType: uint8(EOrderType.Resource),
        resource: uint8(resource),
        count: count,
        price: price
      })
    );
    LibStorage.decreaseStoredResource(homeAsteroid, uint8(EResource.U_Orders), 1);
  }

  function addOrder(
    EOrderType orderType,
    uint8 resource,
    uint256 count,
    uint256 price
  ) public returns (bytes32 orderId) {
    bytes32 playerEntity = _player(true);
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    uint256 orderCount = ResourceCount.get(homeAsteroid, uint8(EResource.U_Orders));
    require(orderCount > 0, "[MarketplaceSystem] Max orders reached");

    orderId = keccak256(abi.encodePacked(resource, count, block.timestamp, msg.sender));
    require(count > 0 && price > 0, "[MarketplaceSystem] Invalid count or price");

    MarketplaceOrder.set(
      orderId,
      MarketplaceOrderData({
        seller: playerEntity,
        orderType: uint8(orderType),
        resource: resource,
        count: count,
        price: price
      })
    );
    LibStorage.decreaseStoredResource(homeAsteroid, uint8(EResource.U_Orders), 1);
  }

  function addUnitOrder(
    EUnit unitType,
    uint256 count,
    uint256 price
  ) public returns (bytes32 orderId) {
    bytes32 playerEntity = _player(true);
    bytes32 homeAsteroid = Home.getAsteroid(playerEntity);
    uint256 orderCount = ResourceCount.get(homeAsteroid, uint8(EResource.U_Orders));
    require(orderCount > 0, "[MarketplaceSystem] Max orders reached");

    orderId = keccak256(abi.encodePacked(unitType, count, block.timestamp, msg.sender));

    MarketplaceOrder.set(
      orderId,
      MarketplaceOrderData({
        seller: playerEntity,
        orderType: uint8(EOrderType.Unit),
        resource: uint8(unitType),
        count: count,
        price: price
      })
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
    if (count == 0) return cancelOrder(orderId);
    MarketplaceOrder.setCount(orderId, count);
  }

  function updateOrderResource(bytes32 orderId, EResource resource) public onlySeller(orderId) {
    MarketplaceOrder.setResource(orderId, uint8(resource));
  }

  function updateOrderPrice(bytes32 orderId, uint256 price) public onlySeller(orderId) {
    MarketplaceOrder.setPrice(orderId, price);
  }

  function takeOrder(bytes32 orderId, uint256 countBought) public {
    bytes32 playerEntity = _player(true);
    if (countBought == 0) revert("[MarketplaceSystem] Invalid count");
    MarketplaceOrderData memory order = MarketplaceOrder.get(orderId);
    require(order.seller != playerEntity, "[MarketplaceSystem] Cannot take your own order");
    require(order.count >= countBought, "[MarketplaceSystem] Not enough resource in order");

    if (order.orderType == uint8(EOrderType.Resource)) {
      _takeResourceOrder(playerEntity, order, countBought);
    } else if (order.orderType == uint8(EOrderType.Unit)) {
      _takeUnitOrder(playerEntity, order, countBought);
    } else {
      revert("[MarketplaceSystem] Invalid order type");
    }

    IERC20Mintable wETH = IERC20Mintable(P_GameConfig2.getWETHAddress());

    uint256 cost = countBought * order.price;
    require(cost <= wETH.balanceOf(entityToAddress(playerEntity)), "[MarketplaceSystem] Not enough weth");

    uint256 tax = (P_GameConfig.getTax() * cost) / 1000;
    cost = cost - tax;

    transferToken(_world(), entityToAddress(order.seller), cost);
    transferToken(_world(), address(1), tax);

    if (countBought == order.count) {
      _removeOrder(orderId);
    } else {
      _updateOrderCount(orderId, order.count - countBought);
    }
  }

  function _takeResourceOrder(
    bytes32 playerEntity,
    MarketplaceOrderData memory order,
    uint256 countBought
  ) internal {
    bytes32 sellerHome = Home.getAsteroid(order.seller);
    bytes32 buyerHome = Home.getAsteroid(playerEntity);

    require(
      ResourceCount.get(sellerHome, order.resource) >= countBought,
      "[MarketplaceSystem] Seller doesn't have enough resources"
    );

    require(
      LibResource.getResourceCountAvailable(buyerHome, order.resource) >= countBought,
      "[MarketplaceSystem] Buyer doesn't have enough space"
    );

    LibStorage.decreaseStoredResource(sellerHome, order.resource, countBought);
    LibStorage.increaseStoredResource(buyerHome, order.resource, countBought);
  }

  function _takeUnitOrder(
    bytes32 playerEntity,
    MarketplaceOrderData memory order,
    uint256 countBought
  ) internal {
    bytes32 sellerHome = Home.getAsteroid(order.seller);
    bytes32 buyerHome = Home.getAsteroid(playerEntity);
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, order.resource);
    require(
      UnitCount.get(order.seller, sellerHome, unitPrototype) >= countBought,
      "[MarketplaceSystem] Seller doesn't have enough units"
    );

    LibUnit.updateStoredUtilities(buyerHome, unitPrototype, countBought, true);
    LibUnit.updateStoredUtilities(sellerHome, unitPrototype, countBought, false);

    LibUnit.increaseUnitCount(playerEntity, buyerHome, unitPrototype, countBought);
    LibUnit.decreaseUnitCount(order.seller, sellerHome, unitPrototype, countBought);
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
