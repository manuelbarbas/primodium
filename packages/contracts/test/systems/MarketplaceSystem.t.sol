// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract MarketplaceSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  EResource[] path;

  function buildMarketplace(address player) public returns (bytes32, bytes32) {
    bytes32 homeAsteroid = spawn(player);
    vm.startPrank(creator);
    P_RequiredBaseLevel.deleteRecord(MarketPrototypeId, 1);
    P_RequiredResources.deleteRecord(MarketPrototypeId, 1);
    vm.stopPrank();
    vm.prank(player);
    bytes32 marketEntity = world.build(EBuilding.Market, getPosition1(player));
    return (homeAsteroid, marketEntity);
  }

  function testTransferResourceFailNotMarket() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Building is not a marketplace");

    path.push(EResource.Iron);
    path.push(EResource.Copper);
    world.swap(asteroid, path, 1, 1);
  }

  function testTransferResourceMarketNotOwned() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(alice);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Not owned by player");
    path.push(EResource.Iron);
    path.push(EResource.Copper);

    world.swap(market, path, 1, 1);
  }

  function testSwapReserveCurrencyOut() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1000;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountA, reserves.amountB);

    MaxResourceCount.set(asteroid, Iron, amountIn);
    ResourceCount.set(asteroid, Iron, amountIn);
    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, 2**256 - 1);

    uint256 prevIron = ResourceCount.get(asteroid, Iron);
    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);
    world.swap(market, path, amountIn, expectedAmountOut);

    // iron should go up
    assertEq(Reserves.getAmountA(Iron, RESERVE_CURRENCY), reserves.amountA + amountIn, "new reserve A");
    // reserve currency should go down
    assertEq(Reserves.getAmountB(Iron, RESERVE_CURRENCY), reserves.amountB - expectedAmountOut, "new reserve B");

    // iron should go down
    assertEq(ResourceCount.get(asteroid, Iron), prevIron - amountIn, "new iron count");
    // reserve currency should go up
    assertEq(ResourceCount.get(asteroid, RESERVE_CURRENCY), expectedAmountOut, "new reserve resource count");
  }

  function testSwapReserveCurrencyIn() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    uint256 prevIron = ResourceCount.get(asteroid, Iron);
    uint256 prevReserveCurrency = ResourceCount.get(asteroid, RESERVE_CURRENCY);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    world.swap(market, path, amountIn, expectedAmountOut);

    // iron should go up
    assertEq(Reserves.getAmountA(Iron, RESERVE_CURRENCY), reserves.amountA - expectedAmountOut, "new reserve A");
    // reserve currency should go down
    assertEq(Reserves.getAmountB(Iron, RESERVE_CURRENCY), reserves.amountB + amountIn, "new reserve B");

    // iron should go down
    assertEq(ResourceCount.get(asteroid, Iron), prevIron + expectedAmountOut, "new iron count");
    // reserve currency should go up
    assertEq(
      ResourceCount.get(asteroid, RESERVE_CURRENCY),
      prevReserveCurrency - amountIn,
      "new reserve resource count"
    );
  }

  function testSwapFailInvalidAmount() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Invalid amount");
    world.swap(market, path, 0, 0);
  }

  function testTransferResourceFailSameResource() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Cannot swap for same resource");
    world.swap(market, path, 1, 0);
  }

  function testSwapFailMinAmountOutTooSmall() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Insufficient output amount");
    world.swap(market, path, amountIn, expectedAmountOut + 1);
  }

  function testSwapFailInsufficientLiquidity() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 inLiquidity = reserves.amountA;
    uint256 amountIn = inLiquidity + 1;

    MaxResourceCount.set(asteroid, Iron, inLiquidity + 1000);
    ResourceCount.set(asteroid, Iron, inLiquidity + 1);
    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, 10000);

    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);

    vm.expectRevert("[Marketplace] Insufficient liquidity");
    world.swap(market, path, amountIn, 0);
  }
}
