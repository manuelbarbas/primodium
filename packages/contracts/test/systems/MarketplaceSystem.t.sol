// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

/* 
To thoroughly test the `MarketplaceSystem` smart contract, consider the following test cases:

4. **Reserve Currency Tests**
   - Attempt to buy with the reserve currency. Ensure correct function in `LibMarketplace` is called.
   - Attempt to sell for the reserve currency. Ensure correct function in `LibMarketplace` is called.
   - Attempt to transfer without involving the reserve currency. Ensure correct function in `LibMarketplace` is called.

6. **Edge Case Tests**
   - Test with boundary values for `amountToTransfer` (e.g., 0, maximum uint256).
   - Test with invalid `marketplaceEntity` and `spaceRockEntity` values.

7. **Gas Usage and Performance Test**
   - Measure gas usage for various transactions to ensure efficiency.

8. **Security Tests**
   - Test for reentrancy vulnerabilities.
   - Test for correct handling of external calls (to `LibMarketplace` and other libraries).

9. **Integration Test**
   - Test the contract's interaction with other contracts and systems it depends on, like `PrimodiumSystem`.

10. **Mocking and Test Environment Setup**
    - Ensure tests are conducted in an environment that accurately simulates mainnet conditions.

Each test should be automated using a framework like Truffle or Hardhat, and assertions should be made to ensure contract behavior aligns with expectations.
*/
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
    world.transferResource(market, EResource.Iron, EResource.Iron, 1);
  }

  function testTransferResourceFailNotMarket() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(creator);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Building is not a marketplace");
    world.transferResource(asteroid, EResource.Iron, EResource.Copper, 1);
  }

  function testTransferResourceMarketNotOwned() public {
    (bytes32 asteroid, bytes32 market) = buildMarketplace(alice);
    vm.startPrank(creator);
    vm.expectRevert("[Marketplace] Not owned by player");
    world.transferResource(market, EResource.Iron, EResource.Copper, 1);
  }
}
