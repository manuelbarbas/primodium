// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibBlueprint } from "libraries/LibBlueprint.sol";
import { LibDebug } from "libraries/LibDebug.sol";
import { getAddressById } from "solecs/utils.sol";

import { BlueprintComponent as Blueprint, ID as BlueprintID } from "components/BlueprintComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";

import "../prototypes/Tiles.sol";

library LibBlueprintInitializer {
  function init(IWorld world) internal {
    Blueprint blueprintComponent = Blueprint(getAddressById(world.components(), BlueprintID));

    int32[] memory coords = new int32[](2);
    coords[0] = 0;
    coords[1] = 0;

    int32[] memory baseCoords = new int32[](18);
    baseCoords[0] = 0;
    baseCoords[1] = 0;

    baseCoords[2] = 0;
    baseCoords[3] = -1;

    baseCoords[4] = 0;
    baseCoords[5] = -2;

    baseCoords[6] = 1;
    baseCoords[7] = 0;

    baseCoords[8] = 1;
    baseCoords[9] = -1;

    baseCoords[10] = 1;
    baseCoords[11] = -2;

    baseCoords[12] = 2;
    baseCoords[13] = 0;

    baseCoords[14] = 2;
    baseCoords[15] = -1;

    baseCoords[16] = 2;
    baseCoords[17] = -2;

    LibBlueprint.createBlueprint(blueprintComponent, MainBaseID, baseCoords);
    LibBlueprint.createBlueprint(blueprintComponent, LithiumMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, IronMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, CopperMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, TitaniumMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, IridiumMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, OsmiumMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, TungstenMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, KimberliteMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, UraniniteMineID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, BolutiteMineID, coords);

    LibBlueprint.createBlueprint(blueprintComponent, SolarPanelID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, HousingUnitID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, IronPlateFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, AlloyFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, LithiumCopperOxideFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, SpaceFuelFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, StorageUnitID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, TrainingFacilityID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, StarMapID, coords);
  }
}
