// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOnSubsystem {
  function executeTyped(address playerAddress) external returns (bytes memory);
}
