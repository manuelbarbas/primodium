// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibTransferTwoWay } from "libraries/fleet/LibTransferTwoWay.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { OwnedBy, IsFleet, FleetMovement, P_UnitPrototypes, P_Transportables } from "codegen/index.sol";

contract TransferTwoWaySystem is PrimodiumSystem {
  function checkCanTransferTwoWay(bytes32 leftEntity, bytes32 rightEntity) private view returns (bool sameOwner) {
    bytes32 player = _player();
    bool leftIsFleet = IsFleet.get(leftEntity);
    bool rightIsFleet = IsFleet.get(rightEntity);
    require(leftIsFleet || rightIsFleet, "[Primodium] At least one entity must be a fleet");
    if (leftIsFleet) {
      require(FleetMovement.getArrivalTime(leftEntity) <= block.timestamp, "[Primodium] Fleet not at destination");
    }
    bytes32 leftAsteroid = leftIsFleet ? FleetMovement.getDestination(leftEntity) : leftEntity;
    if (rightIsFleet) {
      require(FleetMovement.getArrivalTime(rightEntity) <= block.timestamp, "[Primodium] Fleet not at destination");
    }
    bytes32 rightAsteroid = leftIsFleet ? FleetMovement.getDestination(leftEntity) : leftEntity;

    require(leftAsteroid == rightAsteroid, "[Primodium] Entities not at same location");
    bytes32 leftOwnerAsteroid = leftIsFleet ? OwnedBy.get(leftEntity) : leftEntity;
    bytes32 rightOwnerAsteroid = rightIsFleet ? OwnedBy.get(rightEntity) : rightEntity;
    require(
      OwnedBy.get(leftOwnerAsteroid) == player && OwnedBy.get(rightOwnerAsteroid) == player,
      "[Primodium] Both entities not owned by player"
    );
    return leftOwnerAsteroid == rightOwnerAsteroid;
  }

  function transferUnitsTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] calldata unitCounts) public {
    require(unitCounts.length == P_UnitPrototypes.length(), "[Fleet] Incorrect unit array length");
    bool sameOwner = checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferUnitsTwoWay(leftEntity, rightEntity, unitCounts, sameOwner);
  }

  function transferResourcesTwoWay(bytes32 leftEntity, bytes32 rightEntity, int256[] calldata resourceCounts) public {
    require(resourceCounts.length == P_Transportables.get().length, "[Fleet] Incorrect resource array length");

    checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferResourcesTwoWay(leftEntity, rightEntity, resourceCounts);
  }

  function transferUnitsAndResourcesTwoWay(
    bytes32 leftEntity,
    bytes32 rightEntity,
    int256[] calldata unitCounts,
    int256[] calldata resourceCounts
  ) public {
    require(unitCounts.length == P_UnitPrototypes.length(), "[Fleet] Incorrect unit array length");
    require(resourceCounts.length == P_Transportables.get().length, "[Fleet] Incorrect resource array length");

    bool sameOwner = checkCanTransferTwoWay(leftEntity, rightEntity);

    LibTransferTwoWay.transferUnitsAndResourcesTwoWay(leftEntity, rightEntity, unitCounts, resourceCounts, sameOwner);
  }
}
