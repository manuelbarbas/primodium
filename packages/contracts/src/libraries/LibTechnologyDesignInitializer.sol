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
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "libraries/LibSetRequiredResources.sol";
// Items

// Research
import "../prototypes.sol";

library LibTechnologyDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    HasResearchedComponent hasResearchedComponent = HasResearchedComponent(
      getAddressById(components, HasResearchedComponentID)
    );
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    hasResearchedComponent.set(CopperMineResearchID);
    levelComponent.set(CopperMineResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMineResearchID,
      IronResourceItemID,
      300
    );

    hasResearchedComponent.set(CopperMine2ResearchID);
    levelComponent.set(CopperMine2ResearchID, 3);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMine2ResearchID,
      IronResourceItemID,
      1500
    );

    hasResearchedComponent.set(CopperMine3ResearchID);
    levelComponent.set(CopperMine3ResearchID, 5);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMine3ResearchID,
      IronResourceItemID,
      4000
    );

    hasResearchedComponent.set(IronMine2ResearchID);
    levelComponent.set(IronMine2ResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine2ResearchID,
      CopperResourceItemID,
      300
    );

    hasResearchedComponent.set(IronMine3ResearchID);
    levelComponent.set(IronMine3ResearchID, 3);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine3ResearchID,
      CopperResourceItemID,
      3000
    );

    hasResearchedComponent.set(IronPlateFactoryResearchID);
    levelComponent.set(IronPlateFactoryResearchID, 3);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactoryResearchID,
      IronResourceItemID,
      1200,
      CopperResourceItemID,
      1000
    );

    hasResearchedComponent.set(IronPlateFactory2ResearchID);
    levelComponent.set(IronPlateFactory2ResearchID, 4);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory2ResearchID,
      IronResourceItemID,
      3000,
      CopperResourceItemID,
      3000
    );

    hasResearchedComponent.set(IronPlateFactory3ResearchID);
    levelComponent.set(IronPlateFactory3ResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory3ResearchID,
      IronPlateCraftedItemID,
      1200,
      CopperResourceItemID,
      1000
    );
    // hasResearchedComponent.set(IronPlateFactory3ResearchID);
    // levelComponent.set(IronPlateFactory3ResearchID, 5);
    // LibSetRequiredResources.set2RequiredResourcesForEntity(
    //   requiredResources,
    //   itemComponent,
    //   IronPlateFactory3ResearchID,
    //   IronPlateCraftedItemID,
    //   1200,
    //   CopperResourceItemID,
    //   1000
    // );

    // hasResearchedComponent.set(IronPlateFactory4ResearchID);
    // levelComponent.set(IronPlateFactory4ResearchID, 6);
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
    hasResearchedComponent.set(StorageUnitResearchID);
    levelComponent.set(StorageUnitResearchID, 3);
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
    hasResearchedComponent.set(StorageUnit2ResearchID);
    levelComponent.set(StorageUnit2ResearchID, 4);
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
    hasResearchedComponent.set(StorageUnit3ResearchID);
    levelComponent.set(StorageUnit3ResearchID, 5);
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
    hasResearchedComponent.set(LithiumMineResearchID);
    levelComponent.set(LithiumMineResearchID, 4);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      LithiumMineResearchID,
      IronPlateCraftedItemID,
      1000
    );

    // Research LithiumMine2ResearchID with 2000 IronPlateCraftedItemID and 4000 CopperResourceItemID
    hasResearchedComponent.set(LithiumMine2ResearchID);
    levelComponent.set(LithiumMine2ResearchID, 5);
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
    // hasResearchedComponent.set(LithiumMine3ResearchID);
    // levelComponent.set(LithiumMine3ResearchID, 6);
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
    hasResearchedComponent.set(AlloyFactoryResearchID);
    levelComponent.set(AlloyFactoryResearchID, 5);
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
    // hasResearchedComponent.set(AlloyFactory2ResearchID);
    // levelComponent.set(AlloyFactory2ResearchID, 6);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   AlloyFactory2ResearchID,
    //   IronPlateCraftedItemID,
    //   10000
    // );

    // Research AlloyFactory3ResearchID with 3000 IronPlateCraftedItemID and 2000 LithiumResourceItemID
    // hasResearchedComponent.set(AlloyFactory3ResearchID);
    // levelComponent.set(AlloyFactory3ResearchID, 7);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   AlloyFactory3ResearchID,
    //   LithiumCopperOxideCraftedItemID,
    //   3000
    // );

    // Research LithiumCopperOxideFactoryResearchID with 3000 IronPlateCraftedItemID and 5000 CopperReosurceItemID
    hasResearchedComponent.set(LithiumCopperOxideFactoryResearchID);
    levelComponent.set(LithiumCopperOxideFactoryResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumCopperOxideFactoryResearchID,
      IronPlateCraftedItemID,
      3000,
      CopperResourceItemID,
      5000
    );

    // Research LithiumCopperOxideFactory2ResearchID with 10000 IronPlateCraftedItemID and 10000 CopperReosurceItemID    // hasResearchedComponent.set(LithiumCopperOxideFactory2ResearchID);
    // levelComponent.set(LithiumCopperOxideFactory2ResearchID, 6);
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
    // hasResearchedComponent.set(LithiumCopperOxideFactory3ResearchID);
    // levelComponent.set(LithiumCopperOxideFactory3ResearchID, 7);
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
    // hasResearchedComponent.set(SpaceFuelFactoryResearchID);
    // levelComponent.set(SpaceFuelFactoryResearchID, 6);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactoryResearchID,
    //   AlloyCraftedItemID,
    //   1000
    // );
    // // Research SpaceFuelFactory2ResearchID with 3000 AlloyCraftedItemID
    // hasResearchedComponent.set(SpaceFuelFactory2ResearchID);
    // levelComponent.set(SpaceFuelFactory2ResearchID, 7);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactory2ResearchID,
    //   AlloyCraftedItemID,
    //   3000
    // );

    // Research SpaceFuelFactory3ResearchID with 10000 AlloyCraftedItemID
    // hasResearchedComponent.set(SpaceFuelFactory3ResearchID);
    // levelComponent.set(SpaceFuelFactory3ResearchID, 8);
    // LibSetRequiredResources.set1RequiredResourceForEntity(
    //   requiredResources,
    //   itemComponent,
    //   SpaceFuelFactory3ResearchID,
    //   AlloyCraftedItemID,
    //   10000
    // );

    // Research SolarPanelResearchID with 1000 AlloyCraftedItemID
    hasResearchedComponent.set(SolarPanelResearchID);
    levelComponent.set(SolarPanelResearchID, 5);
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
    // hasResearchedComponent.set(SolarPanel2ResearchID);
    // levelComponent.set(SolarPanel2ResearchID, 6);
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
    // hasResearchedComponent.set(SolarPanel3ResearchID);
    // levelComponent.set(SolarPanel3ResearchID, 7);
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
