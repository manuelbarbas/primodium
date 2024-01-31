// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { PositionData, Level } from "../codegen/index.sol";
import { Counter } from "../codegen/index.sol";
import { IsActive } from "../codegen/index.sol";
import { UpgradeBounty } from "../codegen/index.sol";

interface WorldWithUpgradeBuilding {
  function upgradeBuilding(PositionData memory coord) external returns (bytes32 buildingEntity);
}

// !! Note: Building owner must delegate to this contract to upgrade their building
// !! verify usage of msg.sender vs _msgSender()
// !! technically users can deposit upgrade bounties at any coordinate, regardless of building existence
// !! technically Alice can issue an upgrade bounty at Bob's building, and Bob can claim it
contract BuildingUpgradeBountySystem is System {
  function depositBounty(PositionData memory coord) public payable returns (uint256 bountyValue) {
    // Check there isn't an existing bounty on that coord
    require(UpgradeBounty.get(_msgSender(), coord) == 0, "You already have an upgrade building bounty on that coord");

    // Receive ETH deposit and verify it is nonzero
    bountyValue = msg.value;
    require(bountyValue > 0, "Bounty value must be greater than 0");

    // record the value, coord, and depositor address in a mapping in the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), coord, bountyValue);
  }

  function withdrawBounty(PositionData memory coord) public {
    // Check that there is a bounty on that coord
    require(UpgradeBounty.get(_msgSender(), coord) > 0, "You do not have a live upgrade building bounty at that coord");

    // Transfer the bounty value to the caller
    uint256 bountyValue = UpgradeBounty.get(_msgSender(), coord);
    payable(_msgSender()).transfer(bountyValue);

    // Remove the bounty from the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), coord, 0);
  }

  function upgradeForBounty(address bountyPublisher, PositionData memory coord) public returns (bytes32) {
    // Check that there is a bounty on that coord
    require(
      UpgradeBounty.get(bountyPublisher, coord) > 0,
      "That address does not have a live upgrade building bounty at that coord"
    );

    // call the upgradeBuilding function from the World contract
    bytes32 buildingEntity = WorldWithUpgradeBuilding(_world()).upgradeBuilding(coord);

    // Distribute the bounty value from the UpgradeBounty table to the collector
    payable(_msgSender()).transfer(UpgradeBounty.get(bountyPublisher, coord));

    // Remove the bounty from the UpgradeBounty table
    UpgradeBounty.set(bountyPublisher, coord, 0);

    return buildingEntity;
  }
}
