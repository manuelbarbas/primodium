// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// external
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

// tables
import { P_ColonyShipSlotConfigData, OwnedBy } from "codegen/index.sol";

// libraries
import { LibColony } from "libraries/LibColony.sol";
import { LibResource } from "libraries/LibResource.sol";
import { IWorld } from "codegen/world/IWorld.sol";

// types
import { BuildingKey } from "src/Keys.sol";
import { EBuilding } from "src/Types.sol";

contract ColonySystem is PrimodiumSystem {
  function payForColonyShipSlotCapacity(
    bytes32 asteroidEntity,
    P_ColonyShipSlotConfigData calldata payment
  ) external returns (bool) {
    bytes32 playerEntity = OwnedBy.get(asteroidEntity);

    IWorld world = IWorld(_world());
    bool fullPayment = LibResource.spendColonyShipSlotCapacityResources(asteroidEntity, payment);
    if (fullPayment) {
      LibColony.increaseColonyShipSlotCapacity(playerEntity);
    }

    return fullPayment;
  }
}
