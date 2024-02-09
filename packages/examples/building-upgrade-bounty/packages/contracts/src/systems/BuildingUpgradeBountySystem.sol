// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { PositionData, Level } from "../codegen/index.sol";
import { IsActive } from "../codegen/index.sol";
import { UpgradeBounty } from "../codegen/index.sol";
import { OwnedBy } from "../codegen/index.sol";

// import { LibEncode } from "prim-codegen/Libraries.sol";

bytes32 constant BuildingTileKey = bytes32("building:tile");

interface WorldWithUpgradeBuilding {
  function upgradeBuilding(PositionData memory coord) external returns (bytes32 buildingEntity);
}

// !! Note: Building owner must delegate to this contract to upgrade their building
// !! verify usage of msg.sender vs _msgSender()
// !! technically users can deposit upgrade bounties at any coordinate, regardless of building existence
// !! technically Alice can issue an upgrade bounty at Bob's building, and Bob can claim it
contract BuildingUpgradeBountySystem is System {
  // circumvented LibEncode library
  function getHash(bytes32 key, PositionData memory position) internal pure returns (bytes32) {
    return keccak256(abi.encode(key, position.x, position.y, position.parent));
  }

  // circumvented LibBuilding library
  function getBuildingFromCoord(PositionData memory coord) internal view returns (bytes32) {
    bytes32 buildingTile = getHash(BuildingTileKey, coord);
    return OwnedBy.get(buildingTile);
  }

  function depositBounty(PositionData memory coord) public payable returns (uint256 bountyValue) {
    bytes32 buildingEntity = getBuildingFromCoord(coord);

    // Check there isn't an existing bounty on that coord
    require(
      UpgradeBounty.get(_msgSender(), buildingEntity) == 0,
      "You already have an upgrade building bounty on that coord"
    );

    // Receive ETH deposit and verify it is nonzero
    bountyValue = msg.value;
    require(bountyValue > 0, "Bounty value must be greater than 0");

    // record the value, buildingEntity, and depositor address in a mapping in the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), buildingEntity, bountyValue);
  }

  function withdrawBounty(PositionData memory coord) public {
    bytes32 buildingEntity = getBuildingFromCoord(coord);

    // Check that there is a bounty on that buildingEntity
    require(
      UpgradeBounty.get(_msgSender(), buildingEntity) > 0,
      "You do not have a live upgrade building bounty at that coord"
    );

    // Transfer the bounty value to the caller
    uint256 bountyValue = UpgradeBounty.get(_msgSender(), buildingEntity);
    payable(_msgSender()).transfer(bountyValue);

    // Remove the bounty from the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), buildingEntity, 0);
  }

  function upgradeForBounty(
    address bountyPublisher,
    PositionData memory coord
  ) public returns (bytes32 newBuildingEntity) {
    bytes32 oldBuildingEntity = getBuildingFromCoord(coord);
    // Check that there is a bounty on that coord
    require(
      UpgradeBounty.get(bountyPublisher, oldBuildingEntity) > 0,
      "That address does not have a live upgrade building bounty at that coord"
    );

    // call the upgradeBuilding function from the World contract
    newBuildingEntity = WorldWithUpgradeBuilding(_world()).upgradeBuilding(coord);

    // Distribute the bounty value from the UpgradeBounty table to the collector
    payable(_msgSender()).transfer(UpgradeBounty.get(bountyPublisher, oldBuildingEntity));

    // Remove the bounty from the UpgradeBounty table
    UpgradeBounty.set(bountyPublisher, oldBuildingEntity, 0);

    return newBuildingEntity;
  }
}
