// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./PrimodiumTest.t.sol";

contract DeployTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  function testDeploy() public view {
    console.log("Deployer");
    console.log(deployer);
  }
}
