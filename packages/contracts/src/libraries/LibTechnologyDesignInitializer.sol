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
import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { StorageUnitResearchID, IronPlateFactoryResearchID, CopperMine2ResearchID, StorageUnit2ResearchID, IronPlateFactory2ResearchID, LithiumMineResearchID } from "../prototypes/Keys.sol";
import { IronMine2ResearchID, IronMine3ResearchID } from "../prototypes/Keys.sol";
import { StorageUnitResearchID, StorageUnit2ResearchID, StorageUnit3ResearchID } from "../prototypes/Keys.sol";
import { CopperMineResearchID, CopperMine2ResearchID, CopperMine3ResearchID } from "../prototypes/Keys.sol";
import { IronPlateFactoryResearchID, IronPlateFactory2ResearchID, IronPlateFactory3ResearchID } from "../prototypes/Keys.sol";
import { LithiumMineResearchID, LithiumMine2ResearchID, LithiumMine3ResearchID } from "../prototypes/Keys.sol";
import { LibSetRequiredResources } from "libraries/LibSetRequiredResources.sol";

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

    // Research CopperMineResearchID with 300 IronResourceItemID
    researchComponent.set(CopperMineResearchID);
    buildingLevelComponent.set(CopperMineResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMineResearchID,
      IronResourceItemID,
      300
    );

    // Research CopperMine2ResearchID with 300 IronResourceItemID
    researchComponent.set(CopperMine2ResearchID);
    buildingLevelComponent.set(CopperMine2ResearchID, 4);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperMine2ResearchID,
      CopperResourceItemID,
      1000
    );

    // Research CopperMine3ResearchID with 300 IronResourceItemID
    researchComponent.set(CopperMine3ResearchID);
    buildingLevelComponent.set(CopperMine3ResearchID, 5);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronPlateCraftedItemID,
      IronResourceItemID,
      700
    );

    // Research IronMine2ResearchID with 300 CopperResourceItemID
    researchComponent.set(IronMine2ResearchID);
    buildingLevelComponent.set(IronMine2ResearchID, 2);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine2ResearchID,
      CopperResourceItemID,
      300
    );

    // Research IronMine2ResearchID with 300 CopperResourceItemID
    researchComponent.set(IronMine3ResearchID);
    buildingLevelComponent.set(IronMine3ResearchID, 4);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronMine3ResearchID,
      CopperResourceItemID,
      1000
    );

    // Research IronPlateFactoryResearchID with 1200 IronResourceItemID and 1000 CopperResourceItemID
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
    buildingLevelComponent.set(IronPlateFactory2ResearchID, 5);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory2ResearchID,
      IronPlateCraftedItemID,
      1200
    );

    researchComponent.set(IronPlateFactory3ResearchID);
    buildingLevelComponent.set(IronPlateFactory3ResearchID, 6);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IronPlateFactory3ResearchID,
      IronPlateCraftedItemID,
      1200,
      CopperResourceItemID,
      1000
    );

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
      IronPlateCraftedItemID,
      2000,
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

    // Research LithiumMine2ResearchID with 2000 IronResourceItemID and 2000 CopperResourceItemID
    researchComponent.set(LithiumMine2ResearchID);
    buildingLevelComponent.set(LithiumMine2ResearchID, 5);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumMine2ResearchID,
      IronPlateCraftedItemID,
      2000,
      CopperResourceItemID,
      4000
    );

    // Research LithiumMineResearchID with 2000 IronResourceItemID and 2000 CopperResourceItemID
    researchComponent.set(LithiumMine3ResearchID);
    buildingLevelComponent.set(LithiumMine3ResearchID, 6);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumMine3ResearchID,
      IronPlateCraftedItemID,
      3000,
      CopperResourceItemID,
      8000
    );
  }
}
