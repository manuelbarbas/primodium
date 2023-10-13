// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ExpansionPrototypeId, BuildingPrototypeId, IsUtilityPrototypeId, UnitPrototypeId } from "codegen/Prototypes.sol";

bytes32 constant BuildingTileKey = bytes32("building:tile");
bytes32 constant ExpansionKey = ExpansionPrototypeId;
bytes32 constant BuildingKey = BuildingPrototypeId;
bytes32 constant UnitKey = UnitPrototypeId;
bytes32 constant ObjectiveKey = bytes32("objective");
