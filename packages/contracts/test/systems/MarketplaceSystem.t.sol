// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract MarketplaceSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

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

  function testTransferResourceFailSameResource() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Cannot transfer same resource");
    world.swap(market, EResource.Iron, EResource.Iron, 1, 1);
  }

  function testTransferResourceFailNotMarket() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Building is not a marketplace");
    world.swap(asteroid, EResource.Iron, EResource.Copper, 1, 1);
  }

  function testTransferResourceMarketNotOwned() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(alice);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Not owned by player");
    world.swap(market, EResource.Iron, EResource.Copper, 1, 1);
  }

  function testSwapDirect() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    Reserves.set(Iron, Copper, 1000, 1000);

    MaxResourceCount.set(asteroid, Iron, 1000);
    ResourceCount.set(asteroid, Iron, 100);
    MaxResourceCount.set(asteroid, Copper, 1000);
    ResourceCount.set(asteroid, Copper, 100);

    P_MarketplaceConfig.set(0, false);
    LibMarketplace._swap(asteroid, Iron, Copper, 10, 1);

    assertApproxEqAbs(Reserves.getAmountA(Iron, Copper), 1010, 5);
    assertApproxEqAbs(Reserves.getAmountB(Iron, Copper), 990, 5);
    assertApproxEqAbs(ResourceCount.get(asteroid, Iron), 90, 5);
    assertApproxEqAbs(ResourceCount.get(asteroid, Copper), 110, 5);
  }

  function testSwapReserveCurrencyOut() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1000;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountA, reserves.amountB);
    console.log("expected amount out: %s", expectedAmountOut);

    MaxResourceCount.set(asteroid, Iron, amountIn);
    ResourceCount.set(asteroid, Iron, amountIn);
    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, 2**256 - 1);

    uint256 prevIron = ResourceCount.get(asteroid, Iron);
    world.swap(market, EResource.Iron, RESERVE_CURRENCY_RESOURCE, amountIn, expectedAmountOut);

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
    console.log("expected amount out: %s", expectedAmountOut);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    uint256 prevIron = ResourceCount.get(asteroid, Iron);
    uint256 prevReserveCurrency = ResourceCount.get(asteroid, RESERVE_CURRENCY);
    world.swap(market, RESERVE_CURRENCY_RESOURCE, EResource.Iron, amountIn, expectedAmountOut);

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

    vm.expectRevert("[Marketplace] Invalid amount");
    world.swap(market, RESERVE_CURRENCY_RESOURCE, EResource.Iron, 0, 0);
  }

  function testSwapFailMinAmountOutTooSmall() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);
    console.log("expected amount out: %s", expectedAmountOut);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    MaxResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroid, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroid, Iron, 2**256 - 1);

    vm.expectRevert("[Marketplace] Insufficient output amount");
    world.swap(market, RESERVE_CURRENCY_RESOURCE, EResource.Iron, amountIn, expectedAmountOut + 1);
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

    console.log("here");
    vm.expectRevert("[Marketplace] Insufficient liquidity");
    world.swap(market, EResource.Iron, RESERVE_CURRENCY_RESOURCE, amountIn, 0);
  }
}
