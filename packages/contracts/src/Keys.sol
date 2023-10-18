// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ExpansionPrototypeId, BuildingPrototypeId, IsUtilityPrototypeId, UnitPrototypeId, ObjectivesPrototypeId } from "codegen/Prototypes.sol";

bytes32 constant BuildingTileKey = bytes32("building:tile");
bytes32 constant ExpansionKey = ExpansionPrototypeId;
bytes32 constant BuildingKey = BuildingPrototypeId;
bytes32 constant UnitKey = UnitPrototypeId;
bytes32 constant ObjectiveKey = ObjectivesPrototypeId;
