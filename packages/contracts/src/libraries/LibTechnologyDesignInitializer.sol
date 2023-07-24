// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { BuildingLevelComponent, ID as BuildingComponentID } from "components/BuildingLevelComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "libraries/LibSetRequiredResources.sol";
// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID } from "../prototypes/Keys.sol";

// Research
import "../prototypes/Keys.sol";

library LibTechnologyDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );

    researchComponent.set(CopperMineResearchID);
    buildingLevelComponent.set(CopperMineResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMineResearchID,
      IronResourceItemID,
      300
    );

    researchComponent.set(CopperMine2ResearchID);
    buildingLevelComponent.set(CopperMine2ResearchID, 3);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMine2ResearchID,
      IronResourceItemID,
      1500
    );

    researchComponent.set(CopperMine3ResearchID);
    buildingLevelComponent.set(CopperMine3ResearchID, 5);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMine3ResearchID,
      IronResourceItemID,
      4000
    );

    researchComponent.set(IronMine2ResearchID);
    buildingLevelComponent.set(IronMine2ResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine2ResearchID,
      CopperResourceItemID,
      300
    );

    researchComponent.set(IronMine3ResearchID);
    buildingLevelComponent.set(IronMine3ResearchID, 3);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine3ResearchID,
      CopperResourceItemID,
      3000
    );

    researchComponent.set(IronPlateFactoryResearchID);
    buildingLevelComponent.set(IronPlateFactoryResearchID, 3);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactoryResearchID,
      IronResourceItemID,
      1200,
      CopperResourceItemID,
      1000
    );

    researchComponent.set(IronPlateFactory2ResearchID);
    buildingLevelComponent.set(IronPlateFactory2ResearchID, 4);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory2ResearchID,
      IronResourceItemID,
      3000,
      CopperResourceItemID,
      3000
    );

    researchComponent.set(IronPlateFactory3ResearchID);
    buildingLevelComponent.set(IronPlateFactory3ResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory3ResearchID,
      IronPlateCraftedItemID,
      1200,
      CopperResourceItemID,
      1000
    );
    // researchComponent.set(IronPlateFactory3ResearchID);
    // buildingLevelComponent.set(IronPlateFactory3ResearchID, 5);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   IronPlateFactory3ResearchID,
    //   IronPlateCraftedItemID,
    //   1200,
    //   CopperResourceItemID,
    //   1000
    // );

    // researchComponent.set(IronPlateFactory4ResearchID);
    // buildingLevelComponent.set(IronPlateFactory4ResearchID, 6);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   IronPlateFactory4ResearchID,
    //   IronPlateCraftedItemID,
    //   1200,
    //   CopperResourceItemID,
    //   1000
    // );

    // Research StorageUnitResearchID with 1000 IronResourceItemID and 1000 CopperResourceItemID
    researchComponent.set(StorageUnitResearchID);
    buildingLevelComponent.set(StorageUnitResearchID, 3);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      StorageUnitResearchID,
      IronResourceItemID,
      1000,
      CopperResourceItemID,
      1000
    );

    // Research StorageUnit2ResearchID with 2000 IronResourceItemID and 2000 CopperResourceItemID
    researchComponent.set(StorageUnit2ResearchID);
    buildingLevelComponent.set(StorageUnit2ResearchID, 4);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      StorageUnit2ResearchID,
      IronResourceItemID,
      2000,
      CopperResourceItemID,
      2000
    );

    // Research StorageUnit3ResearchID with 2000 IronResourceItemID and 2000 CopperResourceItemID
    researchComponent.set(StorageUnit3ResearchID);
    buildingLevelComponent.set(StorageUnit3ResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      StorageUnit3ResearchID,
      IronResourceItemID,
      4000,
      CopperResourceItemID,
      4000
    );

    // Research LithiumMineResearchID with 2000 IronResourceItemID and 2000 CopperResourceItemID
    researchComponent.set(LithiumMineResearchID);
    buildingLevelComponent.set(LithiumMineResearchID, 4);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      LithiumMineResearchID,
      IronPlateCraftedItemID,
      1000
    );

    // Research LithiumMine2ResearchID with 2000 IronPlateCraftedItemID and 4000 CopperResourceItemID
    researchComponent.set(LithiumMine2ResearchID);
    buildingLevelComponent.set(LithiumMine2ResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumMine2ResearchID,
      IronResourceItemID,
      4000,
      CopperResourceItemID,
      4000
    );

    // Research LithiumMine3ResearchID with 3000 IronPlateCraftedItemID and 8000 CopperResourceItemID
    // researchComponent.set(LithiumMine3ResearchID);
    // buildingLevelComponent.set(LithiumMine3ResearchID, 6);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   LithiumMine3ResearchID,
    //   IronPlateCraftedItemID,
    //   1500,
    //   CopperResourceItemID,
    //   8000
    // );

    // Research AlloyFactoryResearchID with 3000 IronPlateCraftedItemID and 2000 LithiumResourceItemID
    researchComponent.set(AlloyFactoryResearchID);
    buildingLevelComponent.set(AlloyFactoryResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      AlloyFactoryResearchID,
      IronPlateCraftedItemID,
      3000,
      LithiumResourceItemID,
      1000
    );

    // Research AlloyFactory2ResearchID with 3000 IronPlateCraftedItemID and 2000 LithiumResourceItemID
    // researchComponent.set(AlloyFactory2ResearchID);
    // buildingLevelComponent.set(AlloyFactory2ResearchID, 6);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   AlloyFactory2ResearchID,
    //   IronPlateCraftedItemID,
    //   10000
    // );

    // Research AlloyFactory3ResearchID with 3000 IronPlateCraftedItemID and 2000 LithiumResourceItemID
    // researchComponent.set(AlloyFactory3ResearchID);
    // buildingLevelComponent.set(AlloyFactory3ResearchID, 7);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   AlloyFactory3ResearchID,
    //   LithiumCopperOxideCraftedItemID,
    //   3000
    // );

    // Research LithiumCopperOxideFactoryResearchID with 3000 IronPlateCraftedItemID and 5000 CopperReosurceItemID
    researchComponent.set(LithiumCopperOxideFactoryResearchID);
    buildingLevelComponent.set(LithiumCopperOxideFactoryResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumCopperOxideFactoryResearchID,
      IronPlateCraftedItemID,
      3000,
      CopperResourceItemID,
      5000
    );

    // Research LithiumCopperOxideFactory2ResearchID with 10000 IronPlateCraftedItemID and 10000 CopperReosurceItemID    // researchComponent.set(LithiumCopperOxideFactory2ResearchID);
    // buildingLevelComponent.set(LithiumCopperOxideFactory2ResearchID, 6);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   LithiumCopperOxideFactory2ResearchID,
    //   IronResourceItemID,
    //   10000,
    //   CopperResourceItemID,
    //   10000
    // );

    // // Research LithiumCopperOxideFactory3ResearchID with 10000 IronPlateCraftedItemID and 20000 CopperReosurceItemID
    // researchComponent.set(LithiumCopperOxideFactory3ResearchID);
    // buildingLevelComponent.set(LithiumCopperOxideFactory3ResearchID, 7);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   LithiumCopperOxideFactory3ResearchID,
    //   IronPlateCraftedItemID,
    //   10000,
    //   CopperResourceItemID,
    //   20000
    // );

    // // Research SpaceFuelFactoryResearchID with 1000 AlloyCraftedItemID
    // researchComponent.set(SpaceFuelFactoryResearchID);
    // buildingLevelComponent.set(SpaceFuelFactoryResearchID, 6);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactoryResearchID,
    //   AlloyCraftedItemID,
    //   1000
    // );
    // // Research SpaceFuelFactory2ResearchID with 3000 AlloyCraftedItemID
    // researchComponent.set(SpaceFuelFactory2ResearchID);
    // buildingLevelComponent.set(SpaceFuelFactory2ResearchID, 7);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactory2ResearchID,
    //   AlloyCraftedItemID,
    //   3000
    // );

    // Research SpaceFuelFactory3ResearchID with 10000 AlloyCraftedItemID
    // researchComponent.set(SpaceFuelFactory3ResearchID);
    // buildingLevelComponent.set(SpaceFuelFactory3ResearchID, 8);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactory3ResearchID,
    //   AlloyCraftedItemID,
    //   10000
    // );

    // Research SolarPanelResearchID with 1000 AlloyCraftedItemID
    researchComponent.set(SolarPanelResearchID);
    buildingLevelComponent.set(SolarPanelResearchID, 5);
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      SolarPanelResearchID,
      IronResourceItemID,
      2500,
      CopperResourceItemID,
      2500,
      LithiumResourceItemID,
      1500
    );
    // // Research SolarPanelResearchID with 3000 AlloyCraftedItemID
    // researchComponent.set(SolarPanel2ResearchID);
    // buildingLevelComponent.set(SolarPanel2ResearchID, 6);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SolarPanel2ResearchID,
    //   IronResourceItemID,
    //   6000,
    //   CopperResourceItemID,
    //   6000
    // );

    // // Research SolarPanel3ResearchID with 10000 AlloyCraftedItemID
    // researchComponent.set(SolarPanel3ResearchID);
    // buildingLevelComponent.set(SolarPanel3ResearchID, 7);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SolarPanel3ResearchID,
    //   IronPlateCraftedItemID,
    //   8000,
    //   CopperResourceItemID,
    //   10000
    // );
  }
}
