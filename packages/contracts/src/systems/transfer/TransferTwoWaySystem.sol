// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { LibTransferTwoWay } from "libraries/transfer/LibTransferTwoWay.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { OwnedBy, IsFleet, FleetMovement, P_UnitPrototypes, P_Transportables, CooldownEnd } from "codegen/index.sol";

/**
 * @title TransferTwoWaySystem
 * @dev A system to facilitate two-way transfer of units and resources between entities.
 */
contract TransferTwoWaySystem is PrimodiumSystem {
  /**
   * @notice Checks if two entities can transfer units and resources between them.
   * @dev Ensures entities are not the same, at least one entity is a fleet, fleets are at destination, and owned by the same player.
   * @param leftEntity The first entity involved in the transfer.
   * @param rightEntity The second entity involved in the transfer.
   * @return sameAsteroidOwner A boolean indicating if both entities are owned by the same player.
   */
  function checkCanTransferTwoWay(bytes32 leftEntity, bytes32 rightEntity) private returns (bool sameAsteroidOwner) {
    require(leftEntity != rightEntity, "[TransferTwoWay] Cannot transfer to self");
    IWorld world = IWorld(_world());
    bytes32 player = _player();
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);

    require(leftIsFleet || rightIsFleet, "[TransferTwoWay] At least one entity must be a fleet");
    if (leftIsFleet) {
      require(FleetMovement.getArrivalTime(leftEntity) <= block.timestamp, "[TransferTwoWay] Fleet in transit");
      require(block.timestamp >= CooldownEnd.get(leftEntity), "[TransferTwoWay] Fleet is in cooldown");
    } else {
      world.Primodium__claimUnits(leftEntity);
      world.Primodium__claimResources(leftEntity);
    }
    if (rightIsFleet) {
      require(FleetMovement.getArrivalTime(rightEntity) <= block.timestamp, "[TransferTwoWay] Fleet in transit");
      require(block.timestamp >= CooldownEnd.get(rightEntity), "[TransferTwoWay] Fleet is in cooldown");
    } else {
      world.Primodium__claimUnits(rightEntity);
      world.Primodium__claimResources(rightEntity);
    }
    bytes32 leftAsteroid = leftIsFleet ? FleetMovement.getDestination(leftEntity) : leftEntity;
    bytes32 rightAsteroid = rightIsFleet ? FleetMovement.getDestination(rightEntity) : rightEntity;
    require(leftAsteroid == rightAsteroid, "[TransferTwoWay] Entities not at same location");

    bytes32 leftOwnerAsteroid = leftIsFleet ? OwnedBy.get(leftEntity) : leftEntity;
    bytes32 rightOwnerAsteroid = rightIsFleet ? OwnedBy.get(rightEntity) : rightEntity;
    require(
      OwnedBy.get(leftOwnerAsteroid) == player && OwnedBy.get(rightOwnerAsteroid) == player,
      "[TransferTwoWay] Both entities not owned by player"
    );
    return leftOwnerAsteroid == rightOwnerAsteroid;
  }

  /**
   * @notice Transfers units between two entities.
   * @param leftEntity The first entity involved in the transfer.
   * @param rightEntity The second entity involved in the transfer.
   * @param unitCounts The counts of each unit type to be transferred.
   */
  function transferUnitsTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] calldata unitCounts) public {
    require(unitCounts.length == P_UnitPrototypes.length(), "[TransferTwoWay] Incorrect unit array length");

    bool sameAsteroidOwner = checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferUnitsTwoWay(leftEntity, rightEntity, unitCounts, sameAsteroidOwner);
  }

  /**
   * @notice Transfers resources between two entities.
   * @param leftEntity The first entity involved in the transfer.
   * @param rightEntity The second entity involved in the transfer.
   * @param resourceCounts The counts of each resource type to be transferred.
   */
  function transferResourcesTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] calldata resourceCounts) public {
    require(resourceCounts.length == P_Transportables.get().length, "[TransferTwoWay] Incorrect resource array length");

    checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferResourcesTwoWay(leftEntity, rightEntity, resourceCounts);
  }

  /**
   * @notice Transfers units and resources between two entities.
   * @param leftEntity The first entity involved in the transfer.
   * @param rightEntity The second entity involved in the transfer.
   * @param unitCounts The counts of each unit type to be transferred.
   * @param resourceCounts The counts of each resource type to be transferred.
   */
  function transferUnitsAndResourcesTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] calldata unitCounts,
    int256[] calldata resourceCounts
  ) public {
    require(unitCounts.length == P_UnitPrototypes.length(), "[TransferTwoWay] Incorrect unit array length");
    require(resourceCounts.length == P_Transportables.get().length, "[TransferTwoWay] Incorrect resource array length");

    bool sameAsteroidOwner = checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferUnitsAndResourcesTwoWay(
      leftEntity,
      rightEntity,
      unitCounts,
      resourceCounts,
      sameAsteroidOwner
    );
  }
}
