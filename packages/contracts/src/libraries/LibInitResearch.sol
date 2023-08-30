// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue, Dimensions } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInitResearch {
  function init(IWorld world) internal {
    initExpansion(world);
    initAegisDroneUpgrades(world);
    initAnvilDroneUpgrades(world);
    initHammerDroneUpgrades(world);
    initStingerDroneUpgrades(world);
    //initMiningVesselUpgrades(world);
    initMiningResearch(world);
  }

  function initUnitUpgrade(
    IWorld world,
    uint256 researchID,
    uint256 unitType,
    uint32 toLevel,
    uint32 mainBaseLevel,
    ResourceValue[] memory requiredResources
  ) internal {
    P_IsTechComponent(world.getComponent(P_IsTechComponentID)).set(researchID);
    P_UnitLevelUpgradeComponent(world.getComponent(P_UnitLevelUpgradeComponentID)).set(
      researchID,
      ResourceValue({ resource: unitType, value: toLevel })
    );
    LevelComponent(world.getComponent(LevelComponentID)).set(researchID, mainBaseLevel);
    LibSetBuildingReqs.setResourceReqs(world, researchID, requiredResources);
  }

  // In the current design, MiningResearch increases the number of MiningVessels a player can have and unit upgrades initialized in LibInitUnits.sol increases their mining rates. This function is unused but kept here for future balancing and debugging.
  function initMiningVesselUpgrades(IWorld world) internal {
    uint256 unitType = MiningVessel;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // MiningVessel I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    mainBaseLevel = 4;
    initUnitUpgrade(world, MiningVesselUpgrade, unitType, 1, mainBaseLevel, requiredResources);

    // MiningVessel II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 30000 });
    mainBaseLevel = 5;
    initUnitUpgrade(world, MiningVesselUpgrade2, unitType, 2, mainBaseLevel, requiredResources);

    // MiningVessel III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 30000 });
    mainBaseLevel = 6;
    initUnitUpgrade(world, MiningVesselUpgrade3, unitType, 3, mainBaseLevel, requiredResources);

    // MiningVessel IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 30000 });
    mainBaseLevel = 7;
    initUnitUpgrade(world, MiningVesselUpgrade4, unitType, 4, mainBaseLevel, requiredResources);

    // MiningVessel V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 30000 });
    mainBaseLevel = 8;
    initUnitUpgrade(world, MiningVesselUpgrade5, unitType, 5, mainBaseLevel, requiredResources);
  }

  function initAnvilDroneUpgrades(IWorld world) internal {
    uint256 unitType = AnvilDrone;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // AnvilDrone I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 30000 });
    mainBaseLevel = 4;
    initUnitUpgrade(world, AnvilDroneUpgrade, unitType, 1, mainBaseLevel, requiredResources);

    // AnvilDrone II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 50000 });
    mainBaseLevel = 5;
    initUnitUpgrade(world, AnvilDroneUpgrade2, unitType, 2, mainBaseLevel, requiredResources);

    // AnvilDrone III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 100000 });
    mainBaseLevel = 6;
    initUnitUpgrade(world, AnvilDroneUpgrade3, unitType, 3, mainBaseLevel, requiredResources);

    // AnvilDrone IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 160000 });
    mainBaseLevel = 7;
    initUnitUpgrade(world, AnvilDroneUpgrade4, unitType, 4, mainBaseLevel, requiredResources);

    // AnvilDrone V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 220000 });
    mainBaseLevel = 8;
    initUnitUpgrade(world, AnvilDroneUpgrade5, unitType, 5, mainBaseLevel, requiredResources);
  }

  function initHammerDroneUpgrades(IWorld world) internal {
    uint256 unitType = HammerDrone;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // HammerDrone I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 30000 });
    mainBaseLevel = 4;
    initUnitUpgrade(world, HammerDroneUpgrade, unitType, 1, mainBaseLevel, requiredResources);

    // HammerDrone II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 50000 });
    mainBaseLevel = 5;
    initUnitUpgrade(world, HammerDroneUpgrade2, unitType, 2, mainBaseLevel, requiredResources);

    // HammerDrone III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 100000 });
    mainBaseLevel = 6;
    initUnitUpgrade(world, HammerDroneUpgrade3, unitType, 3, mainBaseLevel, requiredResources);

    // HammerDrone IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 160000 });
    mainBaseLevel = 7;
    initUnitUpgrade(world, HammerDroneUpgrade4, unitType, 4, mainBaseLevel, requiredResources);

    // HammerDrone V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 220000 });
    mainBaseLevel = 8;
    initUnitUpgrade(world, HammerDroneUpgrade5, unitType, 5, mainBaseLevel, requiredResources);
  }

  function initAegisDroneUpgrades(IWorld world) internal {
    uint256 unitType = AegisDrone;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // AegisDrone I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 30000 });
    mainBaseLevel = 4;
    initUnitUpgrade(world, AegisDroneUpgrade, unitType, 1, mainBaseLevel, requiredResources);

    // AegisDrone II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 50000 });
    mainBaseLevel = 5;
    initUnitUpgrade(world, AegisDroneUpgrade2, unitType, 2, mainBaseLevel, requiredResources);

    // AegisDrone III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 100000 });
    mainBaseLevel = 6;
    initUnitUpgrade(world, AegisDroneUpgrade3, unitType, 3, mainBaseLevel, requiredResources);

    // AegisDrone IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 160000 });
    mainBaseLevel = 7;
    initUnitUpgrade(world, AegisDroneUpgrade4, unitType, 4, mainBaseLevel, requiredResources);

    // AegisDrone V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 220000 });
    mainBaseLevel = 8;
    initUnitUpgrade(world, AegisDroneUpgrade5, unitType, 5, mainBaseLevel, requiredResources);
  }

  function initStingerDroneUpgrades(IWorld world) internal {
    uint256 unitType = StingerDrone;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // StingerDrone I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 30000 });
    mainBaseLevel = 4;
    initUnitUpgrade(world, StingerDroneUpgrade, unitType, 1, mainBaseLevel, requiredResources);

    // StingerDrone II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 50000 });
    mainBaseLevel = 5;
    initUnitUpgrade(world, StingerDroneUpgrade2, unitType, 2, mainBaseLevel, requiredResources);

    // StingerDrone III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 100000 });
    mainBaseLevel = 6;
    initUnitUpgrade(world, StingerDroneUpgrade3, unitType, 3, mainBaseLevel, requiredResources);

    // StingerDrone IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 160000 });
    mainBaseLevel = 7;
    initUnitUpgrade(world, StingerDroneUpgrade4, unitType, 4, mainBaseLevel, requiredResources);

    // StingerDrone V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 220000 });
    mainBaseLevel = 8;
    initUnitUpgrade(world, StingerDroneUpgrade5, unitType, 5, mainBaseLevel, requiredResources);
  }

  function initExpansion(IWorld world) internal {
    Dimensions memory maxRange = Dimensions(37, 25);
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_IsTechComponent isTechComponent = P_IsTechComponent(world.getComponent(P_IsTechComponentID));
    DimensionsComponent dimensionsComponent = DimensionsComponent(world.getComponent(DimensionsComponentID));
    dimensionsComponent.set(ExpansionResearch, Dimensions(13, 11));
    ResourceValue[] memory requiredResources = new ResourceValue[](1);

    // Expansion II: 1000 iron
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: CopperResourceItemID, value: 4000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch2, requiredResources);
    isTechComponent.set(ExpansionResearch2);
    levelComponent.set(ExpansionResearch2, 2);
    dimensionsComponent.set(ExpansionResearch2, Dimensions(17, 13));

    // Expansion III: 2000 copper
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: LithiumResourceItemID, value: 8000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch3, requiredResources);
    isTechComponent.set(ExpansionResearch3);
    levelComponent.set(ExpansionResearch3, 3);
    dimensionsComponent.set(ExpansionResearch3, Dimensions(21, 15));

    // Expansion IV: 3000 iron plates
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 10000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch4, requiredResources);
    isTechComponent.set(ExpansionResearch4);
    levelComponent.set(ExpansionResearch4, 4);
    dimensionsComponent.set(ExpansionResearch4, Dimensions(25, 17));

    // Expansion V: 4000 lithium
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 20000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch5, requiredResources);
    isTechComponent.set(ExpansionResearch5);
    levelComponent.set(ExpansionResearch5, 5);
    dimensionsComponent.set(ExpansionResearch5, Dimensions(29, 19));

    // Expansion VI: 5000 lithium
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 50000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch6, requiredResources);
    isTechComponent.set(ExpansionResearch6);
    levelComponent.set(ExpansionResearch6, 6);
    dimensionsComponent.set(ExpansionResearch6, Dimensions(33, 23));

    // Expansion VII: 6000 lithium, 2000 iron plates
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 70000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch7, requiredResources);
    isTechComponent.set(ExpansionResearch7);
    levelComponent.set(ExpansionResearch7, 7);
    dimensionsComponent.set(ExpansionResearch7, maxRange);
  }

  function InitUtilityResearch(
    IWorld world,
    uint256 researchID,
    ResourceValue memory utilityIncrease,
    uint32 mainBaseLevel,
    ResourceValue[] memory requiredResources
  ) internal {
    P_IsTechComponent(world.getComponent(P_IsTechComponentID)).set(researchID);
    LevelComponent(world.getComponent(LevelComponentID)).set(researchID, mainBaseLevel);
    LibSetBuildingReqs.setResourceReqs(world, researchID, requiredResources);
    P_UtilityProductionComponent(world.getComponent(P_UtilityProductionComponentID)).set(researchID, utilityIncrease);
  }

  // In the current design, MiningResearch increases the number of MiningVessels a player can have
  function initMiningResearch(IWorld world) internal {
    uint256 utilityResource = VesselUtilityResourceID;
    ResourceValue[] memory requiredResources = new ResourceValue[](1);
    uint32 mainBaseLevel;

    // MiningResearch I:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PhotovoltaicCellCraftedItemID, value: 5000 });
    mainBaseLevel = 4;
    InitUtilityResearch(world, MiningResearch, ResourceValue(utilityResource, 1), mainBaseLevel, requiredResources);

    // MiningResearch II:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: TitaniumResourceItemID, value: 30000 });
    mainBaseLevel = 5;
    InitUtilityResearch(world, MiningResearch2, ResourceValue(utilityResource, 1), mainBaseLevel, requiredResources);

    // MiningResearch III:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: PlatinumResourceItemID, value: 30000 });
    mainBaseLevel = 6;
    InitUtilityResearch(world, MiningResearch3, ResourceValue(utilityResource, 1), mainBaseLevel, requiredResources);

    // MiningResearch IV:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IridiumResourceItemID, value: 30000 });
    mainBaseLevel = 7;
    InitUtilityResearch(world, MiningResearch4, ResourceValue(utilityResource, 1), mainBaseLevel, requiredResources);

    // MiningResearch V:
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: KimberliteResourceItemID, value: 30000 });
    mainBaseLevel = 8;
    InitUtilityResearch(world, MiningResearch5, ResourceValue(utilityResource, 1), mainBaseLevel, requiredResources);
  }
}
