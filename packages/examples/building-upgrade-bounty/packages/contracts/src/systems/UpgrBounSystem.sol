// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { PositionData } from "../codegen/index.sol";
import { UpgradeBounty } from "../codegen/index.sol";
import { OwnedBy } from "../codegen/index.sol";
import { IWorld } from "../codegen/world/IWorld.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { WorldResourceIdLib, ROOT_NAMESPACE } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

// import { LibEncode } from "prim-codegen/Libraries.sol";

// Taken from prim-contracts/src/Keys.sol
bytes32 constant BuildingTileKey = bytes32("building:tile");

interface WorldWithUpgradeBuilding {
  function upgradeBuilding(PositionData memory coord) external returns (bytes32 buildingEntity);

  function callFrom(
    address delegator,
    ResourceId systemId,
    bytes memory callData
  ) external payable returns (bytes memory);
}

// !! Note: Building owner must delegate to this contract to upgrade their building
// !! verify usage of msg.sender vs _msgSender()
// !! technically users can deposit upgrade bounties at any coordinate, regardless of building existence
// !! technically Alice can issue an upgrade bounty at Bob's building, and Bob can claim it
contract UpgrBounSystem is System {
  /* ----------------------------- Picked from Library --------------------------------- */
  // circumvented LibEncode library, will fix DevEx in future update (only necessary for coord)
  function getHash(bytes32 key, PositionData memory position) internal pure returns (bytes32) {
    return keccak256(abi.encode(key, position.x, position.y, position.parent));
  }

  // circumvented LibBuilding library, will fix DevEx in future update by refactoring buildings/coord
  function getBuildingFromCoord(PositionData memory coord) internal view returns (bytes32) {
    bytes32 buildingTile = getHash(BuildingTileKey, coord);
    return OwnedBy.get(buildingTile);
  }

  /* ------------------------------ Actual Contract ----------------------------------- */
  function depositBounty(PositionData memory coord) public payable returns (uint256 bountyValue) {
    // artefact of how Primodium handles buildings and coordinates, will be fixed in future update
    bytes32 buildingEntity = getBuildingFromCoord(coord);

    // Check that the sender doesn't already have a live bounty on that buildingEntity
    require(
      UpgradeBounty.get(_msgSender(), buildingEntity) == 0,
      "You already have an upgrade building bounty on that coord"
    );

    // Receive ETH deposit and verify it is nonzero
    require(_msgValue() > 0, "Bounty value must be greater than 0");
    bountyValue = _msgValue();

    // record the depositor address, buildingEntity, and value in the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), buildingEntity, bountyValue);
  }

  // !! If Alice gives Bob system access, Bob could try to call this function but only can claim his own deposted bounty
  // !!? If Alice delegates her system access to Bob and Bob uses callFrom() on this function, who does Alice's bounty go to?
  function withdrawBounty(PositionData memory coord) public returns (uint256 bountyValue) {
    bytes32 buildingEntity = getBuildingFromCoord(coord);

    // Check that there is a bounty on that buildingEntity
    require(
      UpgradeBounty.get(_msgSender(), buildingEntity) > 0,
      "You do not have a live upgrade building bounty at that coord"
    );

    // Prep params for the transferBalanceToAddress function
    IWorld world = IWorld(_world());
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("upgradeBounty"));
    bountyValue = UpgradeBounty.get(_msgSender(), buildingEntity);

    // Transfer the bounty value to the caller
    world.transferBalanceToAddress(namespaceResource, _msgSender(), bountyValue);

    // Remove the claimed bounty from the UpgradeBounty table
    UpgradeBounty.set(_msgSender(), buildingEntity, 0);
  }

  function upgradeForBounty(
    address bountyPublisher,
    PositionData memory coord
  ) public returns (bytes memory newBuildingEntity) {
    bytes32 oldBuildingEntity = getBuildingFromCoord(coord);
    // Check that there is a bounty on that coord
    require(
      UpgradeBounty.get(bountyPublisher, oldBuildingEntity) > 0,
      "That address does not have a live upgrade building bounty at that coord"
    );

    // Call the upgradeBuilding function from the World contract
    ResourceId upgradeBuildingSystemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, ROOT_NAMESPACE, "UpgradeBuildingS");
    newBuildingEntity = WorldWithUpgradeBuilding(_world()).callFrom(
      bountyPublisher,
      upgradeBuildingSystemId,
      abi.encodeWithSignature("upgradeBuilding((int32,int32,bytes32))", (coord))
      //"upgradeBuilding(coord)"
    );

    // Prep params for the transferBalanceToAddress function
    uint256 bountyValue = UpgradeBounty.get(bountyPublisher, oldBuildingEntity);
    IWorld world = IWorld(_world());
    ResourceId namespaceResource = WorldResourceIdLib.encodeNamespace(bytes14("upgradeBounty"));

    // Distribute the bounty value from the UpgradeBounty table to the collector
    world.transferBalanceToAddress(namespaceResource, _msgSender(), bountyValue);

    // Remove the bounty from the UpgradeBounty table
    UpgradeBounty.set(bountyPublisher, oldBuildingEntity, 0);

    return newBuildingEntity;
  }
}
