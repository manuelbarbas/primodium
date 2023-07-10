// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibBlueprint } from "libraries/LibBlueprint.sol";
import { LibDebug } from "libraries/LibDebug.sol";
import { getAddressById } from "solecs/utils.sol";

import { BlueprintComponent as Blueprint, ID as BlueprintID } from "components/BlueprintComponent.sol";
import { MainBaseID, BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID, SiloID } from "../prototypes/Tiles.sol";

import { LithiumMineID, IronMineID, CopperMineID, TitaniumMineID, IridiumMineID, OsmiumMineID, TungstenMineID, KimberliteMineID, UraniniteMineID, BolutiteMineID } from "../prototypes/Tiles.sol";

library LibBlueprintInitializer {
  function init(IWorld world) internal {
    Blueprint blueprintComponent = Blueprint(getAddressById(world.components(), BlueprintID));

    int32[] memory coords = new int32[](2);
    coords[0] = 0;
    coords[1] = 0;

    LibBlueprint.createBlueprint(blueprintComponent, MainBaseID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, BasicMinerID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, NodeID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, PlatingFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, BasicBatteryFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, KineticMissileFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, ProjectileLauncherID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, HardenedDrillID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, DenseMetalRefineryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, AdvancedBatteryFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, HighTempFoundryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, PrecisionMachineryFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, IridiumDrillbitFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, PrecisionPneumaticDrillID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, PenetratorFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, PenetratingMissileFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, MissileLaunchComplexID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, HighEnergyLaserFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, ThermobaricWarheadFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, ThermobaricMissileFactoryID, coords);
    LibBlueprint.createBlueprint(blueprintComponent, KimberliteCatalystFactoryID, coords);
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

    if (LibDebug.isDebug()) {
      LibBlueprint.createBlueprint(blueprintComponent, DebugNodeID, coords);
      LibBlueprint.createBlueprint(blueprintComponent, MinerID, coords);
      LibBlueprint.createBlueprint(blueprintComponent, LithiumMinerID, coords);
      LibBlueprint.createBlueprint(blueprintComponent, BulletFactoryID, coords);
      LibBlueprint.createBlueprint(blueprintComponent, DebugPlatingFactoryID, coords);
      LibBlueprint.createBlueprint(blueprintComponent, SiloID, coords);
    }
  }
}
