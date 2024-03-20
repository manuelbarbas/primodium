// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { console, PrimodiumTest } from "test/PrimodiumTest.t.sol";
import { addressToEntity } from "src/utils.sol";

import { MarketPrototypeId } from "codegen/Prototypes.sol";
import { EResource, EBuilding } from "src/types.sol";
import { UnitKey } from "src/Keys.sol";

import { ReservesData, Position, PositionData, P_RequiredBaseLevel, P_RequiredResources, P_EnumToPrototype, PositionData, MaxResourceCount, ResourceCount, Reserves } from "codegen/index.sol";
import { RESERVE_CURRENCY_RESOURCE, RESERVE_CURRENCY } from "src/constants.sol";

import { LibMarketplace } from "libraries/LibMarketplace.sol";

contract MarketplaceSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
  }

  EResource[] path;

  /* --------------------------------- Helpers -------------------------------- */

  function buildMarketplace(address player) public returns (bytes32, bytes32) {
    bytes32 homeAsteroidEntity = spawn(player);
    vm.startPrank(creator);
    P_RequiredBaseLevel.deleteRecord(MarketPrototypeId, 1);
    P_RequiredResources.deleteRecord(MarketPrototypeId, 1);
    switchPrank(player);

    bytes32 marketEntity = world.Primodium__build(
      EBuilding.Market,
      getTilePosition(homeAsteroidEntity, EBuilding.Market)
    );
    vm.stopPrank();
    return (homeAsteroidEntity, marketEntity);
  }

  function testSwapSanityCheck() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    uint256 amountIn = 10e18;
    uint256 reserveOut = LibMarketplace.getAmountOut(
      amountIn,
      Reserves.getAmountA(Iron, RESERVE_CURRENCY),
      Reserves.getAmountB(Iron, RESERVE_CURRENCY)
    );
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(
      reserveOut,
      Reserves.getAmountB(Iron, RESERVE_CURRENCY),
      Reserves.getAmountA(Iron, RESERVE_CURRENCY)
    );

    console.log("Reserve out: %s", reserveOut);
    console.log("Expected amount out: %s", expectedAmountOut);

    MaxResourceCount.set(asteroidEntity, Iron, MAX_INT);
    ResourceCount.set(asteroidEntity, Iron, amountIn);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, MAX_INT);

    world.Primodium__swap(market, path, amountIn, 0);

    console.log(ResourceCount.get(asteroidEntity, Iron) / 1e18);
  }

  /* ---------------------------------- Swap ---------------------------------- */
  function testSwapFailNotMarket() public {
    (bytes32 asteroidEntity, ) = buildMarketplace(creator);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Building is not a marketplace");

    path.push(EResource.Iron);
    path.push(EResource.Copper);
    world.Primodium__swap(asteroidEntity, path, 1, 1);
  }

  function testSwapMarketNotOwned() public {
    (, bytes32 market) = buildMarketplace(alice);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Not owned by player");
    path.push(EResource.Iron);
    path.push(EResource.Copper);

    world.Primodium__swap(market, path, 1, 1);
  }

  function testSwapReserveCurrencyOut() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1000;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountA, reserves.amountB);

    MaxResourceCount.set(asteroidEntity, Iron, amountIn);
    ResourceCount.set(asteroidEntity, Iron, amountIn);
    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, 2 ** 256 - 1);

    uint256 prevIron = ResourceCount.get(asteroidEntity, Iron);
    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);
    world.Primodium__swap(market, path, amountIn, expectedAmountOut);

    // iron should go up
    assertEq(Reserves.getAmountA(Iron, RESERVE_CURRENCY), reserves.amountA + amountIn, "new reserve A");
    // reserve currency should go down
    assertEq(Reserves.getAmountB(Iron, RESERVE_CURRENCY), reserves.amountB - expectedAmountOut, "new reserve B");

    // iron should go down
    assertEq(ResourceCount.get(asteroidEntity, Iron), prevIron - amountIn, "new iron count");
    // reserve currency should go up
    assertEq(ResourceCount.get(asteroidEntity, RESERVE_CURRENCY), expectedAmountOut, "new reserve resource count");
  }

  function testSwapReserveCurrencyIn() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    uint256 prevIron = ResourceCount.get(asteroidEntity, Iron);
    uint256 prevReserveCurrency = ResourceCount.get(asteroidEntity, RESERVE_CURRENCY);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    world.Primodium__swap(market, path, amountIn, expectedAmountOut);

    // iron should go up
    assertEq(Reserves.getAmountA(Iron, RESERVE_CURRENCY), reserves.amountA - expectedAmountOut, "new reserve A");
    // reserve currency should go down
    assertEq(Reserves.getAmountB(Iron, RESERVE_CURRENCY), reserves.amountB + amountIn, "new reserve B");

    // iron should go down
    assertEq(ResourceCount.get(asteroidEntity, Iron), prevIron + expectedAmountOut, "new iron count");
    // reserve currency should go up
    assertEq(
      ResourceCount.get(asteroidEntity, RESERVE_CURRENCY),
      prevReserveCurrency - amountIn,
      "new reserve resource count"
    );
  }

  function testSwapFailInvalidAmount() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Invalid amount");
    world.Primodium__swap(market, path, 0, 0);
  }

  function testSwapFailInvalidResource() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.U_Electricity);
    path.push(RESERVE_CURRENCY_RESOURCE);

    vm.expectRevert("[Marketplace] Invalid resource");
    world.Primodium__swap(market, path, amountIn, expectedAmountOut);

    path = new EResource[](2);
    path.push(EResource.U_Electricity);
    path.push(RESERVE_CURRENCY_RESOURCE);

    vm.expectRevert("[Marketplace] Invalid resource");
    world.Primodium__swap(market, path, amountIn, expectedAmountOut);
  }

  function testSwapFailInvalidPath() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);

    vm.expectRevert("[Marketplace] Invalid amount");
    world.Primodium__swap(market, path, 0, 0);

    path.push(EResource.Iron);
    vm.expectRevert("[Marketplace] Invalid amount");
    world.Primodium__swap(market, path, 0, 0);
  }

  function testSwapFailSameResource() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Cannot swap for same resource");
    world.Primodium__swap(market, path, 1, 0);
  }

  function testSwapFailMinAmountOutTooSmall() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    vm.expectRevert("[Marketplace] Insufficient output amount");
    world.Primodium__swap(market, path, amountIn, expectedAmountOut + 1);
  }

  function testSwapFailInsufficientLiquidity() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 inLiquidity = reserves.amountA;
    uint256 amountIn = inLiquidity + 1;

    MaxResourceCount.set(asteroidEntity, Iron, inLiquidity + 1000);
    ResourceCount.set(asteroidEntity, Iron, inLiquidity + 1);
    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, 10000);

    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);

    vm.expectRevert("[Marketplace] Insufficient liquidity");
    world.Primodium__swap(market, path, amountIn, 0);
  }

  function testSwapAcrossCurves() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    path.push(EResource.Iron);
    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Copper);

    uint256 amountIn = 1e6;
    uint256 reserveOut = LibMarketplace.getAmountOut(
      amountIn,
      Reserves.getAmountA(Iron, RESERVE_CURRENCY),
      Reserves.getAmountB(Iron, RESERVE_CURRENCY)
    );
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(
      reserveOut,
      Reserves.getAmountB(Copper, RESERVE_CURRENCY),
      Reserves.getAmountA(Copper, RESERVE_CURRENCY)
    );
    console.log("Reserve out: %s", reserveOut);
    console.log("Expected amount out: %s", expectedAmountOut);

    MaxResourceCount.set(asteroidEntity, Iron, amountIn);
    ResourceCount.set(asteroidEntity, Iron, amountIn);
    MaxResourceCount.set(asteroidEntity, Copper, MAX_INT);
    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, MAX_INT);

    world.Primodium__swap(market, path, amountIn, 0);

    assertEq(ResourceCount.get(asteroidEntity, Iron), 0, "iron");
    assertEq(ResourceCount.get(asteroidEntity, RESERVE_CURRENCY), 0, "reserve");
    assertEq(ResourceCount.get(asteroidEntity, Copper), expectedAmountOut, "copper");
  }

  /* ---------------------------------- Admin --------------------------------- */

  function testLock() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    world.Primodium__toggleMarketplaceLock();
    vm.expectRevert("[Marketplace] Marketplace is locked");

    world.Primodium__swap(market, path, 0, 0);
  }

  function testUnlock() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);

    vm.startPrank(creator);
    world.Primodium__toggleMarketplaceLock();
    world.Primodium__toggleMarketplaceLock();
    ReservesData memory reserves = Reserves.get(Iron, RESERVE_CURRENCY);
    uint256 amountIn = 1e18;
    uint256 expectedAmountOut = LibMarketplace.getAmountOut(amountIn, reserves.amountB, reserves.amountA);

    MaxResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    ResourceCount.set(asteroidEntity, RESERVE_CURRENCY, amountIn);
    MaxResourceCount.set(asteroidEntity, Iron, 2 ** 256 - 1);

    uint256 prevIron = ResourceCount.get(asteroidEntity, Iron);
    uint256 prevReserveCurrency = ResourceCount.get(asteroidEntity, RESERVE_CURRENCY);

    path.push(RESERVE_CURRENCY_RESOURCE);
    path.push(EResource.Iron);

    world.Primodium__swap(market, path, amountIn, expectedAmountOut);
  }

  function testLockFailNotAdmin() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(alice);
    vm.expectRevert("[Primodium] Only admin");
    world.Primodium__toggleMarketplaceLock();
  }

  function testAddLiquidity() public {
    vm.startPrank(creator);
    world.Primodium__addLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
    assertEq(Reserves.getAmountA(Iron, Copper), 1000);
    assertEq(Reserves.getAmountB(Iron, Copper), 1000);
  }

  function testIsolatedPairReserves() public {
    (bytes32 asteroidEntity, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);

    world.Primodium__addLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
    world.Primodium__addLiquidity(EResource.Copper, EResource.Lithium, 1000, 1000);
    assertEq(Reserves.getAmountA(Iron, Copper), 1000);
    assertEq(Reserves.getAmountB(Iron, Copper), 1000);
  }

  function testAddLiquidityFailNotAdmin() public {
    vm.startPrank(alice);
    vm.expectRevert("[Primodium] Only admin");
    world.Primodium__addLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
  }

  function testRemoveLiquidity() public {
    vm.startPrank(creator);
    world.Primodium__addLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
    world.Primodium__removeLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
    assertEq(Reserves.getAmountA(Iron, Copper), 0);
    assertEq(Reserves.getAmountB(Iron, Copper), 0);
  }

  function testRemoveLiquidityFailNotAdmin() public {
    vm.startPrank(alice);
    vm.expectRevert("[Primodium] Only admin");
    world.Primodium__removeLiquidity(EResource.Iron, EResource.Copper, 1000, 1000);
  }
}
