// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInitResearch {
  function init(IWorld world) internal {
    LevelComponent levelComponent = LevelComponent(world.getComponent(LevelComponentID));
    P_IsTechComponent isTechComponent = P_IsTechComponent(world.getComponent(P_IsTechComponentID));

    ResourceValue[] memory requiredResources = new ResourceValue[](1);

    // Copper Mine
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 300 });
    LibSetBuildingReqs.setResourceReqs(world, CopperMineResearchID, requiredResources);
    levelComponent.set(CopperMineResearchID, 2);
    isTechComponent.set(CopperMineResearchID);

    levelComponent.set(CopperMine2ResearchID, 3);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 1500 });
    LibSetBuildingReqs.setResourceReqs(world, CopperMine2ResearchID, requiredResources);
    isTechComponent.set(CopperMine2ResearchID);

    levelComponent.set(CopperMine3ResearchID, 5);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 4000 });
    LibSetBuildingReqs.setResourceReqs(world, CopperMine3ResearchID, requiredResources);
    isTechComponent.set(CopperMine3ResearchID);

    // Iron Mine
    levelComponent.set(IronMine2ResearchID, 2);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: CopperResourceItemID, value: 300 });
    LibSetBuildingReqs.setResourceReqs(world, IronMine2ResearchID, requiredResources);
    isTechComponent.set(IronMine2ResearchID);

    levelComponent.set(IronMine3ResearchID, 3);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    LibSetBuildingReqs.setResourceReqs(world, IronMine3ResearchID, requiredResources);
    isTechComponent.set(IronMine3ResearchID);

    // Iron Plate Factory
    levelComponent.set(IronPlateFactoryResearchID, 3);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 1200 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, IronPlateFactoryResearchID, requiredResources);
    isTechComponent.set(IronPlateFactoryResearchID);

    levelComponent.set(IronPlateFactory2ResearchID, 4);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 3000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 3000 });
    LibSetBuildingReqs.setResourceReqs(world, IronPlateFactory2ResearchID, requiredResources);
    isTechComponent.set(IronPlateFactory2ResearchID);

    levelComponent.set(IronPlateFactory3ResearchID, 5);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1200 });
    LibSetBuildingReqs.setResourceReqs(world, IronPlateFactory3ResearchID, requiredResources);
    isTechComponent.set(IronPlateFactory3ResearchID);

    // Storage Unit
    levelComponent.set(StorageUnitResearchID, 3);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 1000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, StorageUnitResearchID, requiredResources);
    isTechComponent.set(StorageUnitResearchID);

    levelComponent.set(StorageUnit2ResearchID, 4);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 2000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 2000 });
    LibSetBuildingReqs.setResourceReqs(world, StorageUnit2ResearchID, requiredResources);
    isTechComponent.set(StorageUnit2ResearchID);

    levelComponent.set(StorageUnit3ResearchID, 5);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 4000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 4000 });
    LibSetBuildingReqs.setResourceReqs(world, StorageUnit3ResearchID, requiredResources);
    isTechComponent.set(StorageUnit3ResearchID);

    // Lithium Mine
    levelComponent.set(LithiumMineResearchID, 4);
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, LithiumMineResearchID, requiredResources);
    isTechComponent.set(LithiumMineResearchID);

    levelComponent.set(LithiumMine2ResearchID, 5);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 4000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 4000 });
    LibSetBuildingReqs.setResourceReqs(world, CopperMine2ResearchID, requiredResources);
    isTechComponent.set(LithiumMine2ResearchID);

    // Alloy Factory
    levelComponent.set(AlloyFactoryResearchID, 5);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    requiredResources[1] = ResourceValue({ resource: LithiumResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, AlloyFactoryResearchID, requiredResources);
    isTechComponent.set(AlloyFactoryResearchID);

    // Lithium Copper Oxide Factory
    levelComponent.set(LithiumCopperOxideFactoryResearchID, 5);
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: IronPlateCraftedItemID, value: 3000 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 5000 });
    LibSetBuildingReqs.setResourceReqs(world, LithiumCopperOxideFactoryResearchID, requiredResources);
    isTechComponent.set(LithiumCopperOxideFactoryResearchID);

    // Solar Panel
    levelComponent.set(SolarPanelResearchID, 5);
    requiredResources = new ResourceValue[](3);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 2500 });
    requiredResources[1] = ResourceValue({ resource: CopperResourceItemID, value: 2500 });
    requiredResources[2] = ResourceValue({ resource: LithiumResourceItemID, value: 1500 });
    LibSetBuildingReqs.setResourceReqs(world, SolarPanelResearchID, requiredResources);
    isTechComponent.set(SolarPanelResearchID);

    // Expansion

    // Expansion Level II: 1000 iron
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 1000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch2, requiredResources);
    isTechComponent.set(ExpansionResearch2);

    // Expansion III: 2000 copper
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: CopperResourceItemID, value: 2000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch3, requiredResources);
    isTechComponent.set(ExpansionResearch3);

    // Expansion IV: 3000 iron plates
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: IronResourceItemID, value: 3000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch4, requiredResources);
    isTechComponent.set(ExpansionResearch4);

    // Expansion V: 4000 lithium, main base level V
    requiredResources = new ResourceValue[](1);
    requiredResources[0] = ResourceValue({ resource: LithiumResourceItemID, value: 4000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch5, requiredResources);
    isTechComponent.set(ExpansionResearch5);
    levelComponent.set(ExpansionResearch5, 5);

    // Expansion VI: 5000 lithium, 2000 iron plates, main base level VI
    requiredResources = new ResourceValue[](2);
    requiredResources[0] = ResourceValue({ resource: LithiumResourceItemID, value: 5000 });
    requiredResources[1] = ResourceValue({ resource: IronPlateCraftedItemID, value: 2000 });
    LibSetBuildingReqs.setResourceReqs(world, ExpansionResearch6, requiredResources);
    isTechComponent.set(ExpansionResearch6);
    levelComponent.set(ExpansionResearch6, 6);
  }
}
