// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Level, BuildingType, P_UnitProduction } from "codegen/Tables.sol";

library LibUnit {
  function canProduceUnit(bytes32 buildingEntity, bytes32 unitPrototype) internal view returns (bool) {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    return P_UnitProduction.get(buildingPrototype, unitPrototype);
  }
}
