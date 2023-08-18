// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue, Dimensions, EMotherlodeType, EMotherlodeSize } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInit {
  function init(IWorld world) internal {
    initResources(world);
  }

  function initResources(IWorld world) internal {
    // tracks the total number of a resource a motherlode can produce
    P_ProductionComponent productionComponent = P_ProductionComponent(world.getComponent(P_ProductionComponentID));

    // TITANIUM
    // SMALL
    ResourceValue memory ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );

    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // IRIDIUM

    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // PLATINUM
    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // KIMBERLITE
    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    productionComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.LARGE)),
      ore
    );
  }
}
