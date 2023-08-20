// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";

// Components
import { P_MotherlodeResourceComponent, ID as P_MotherlodeResourceComponentID } from "components/P_MotherlodeResourceComponent.sol";

// Libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetBuildingReqs } from "../libraries/LibSetBuildingReqs.sol";
// Items
import { ResourceValue, Dimensions, EMotherlodeType, EMotherlodeSize } from "../types.sol";

// Research
import "../prototypes.sol";

library LibInitMotherlode {
  function init(IWorld world) internal {
    initResources(world);
  }

  function initResources(IWorld world) internal {
    // MotherlodeResourceComponent tracks the total amount of a resource a motherlode can produce
    // the current amount of a resource mined is stored in OccupiedUtilityResourceComponent, and once the maximum is reached, it resets to 0 and cooldown begins
    // if cooldown hasn't passed, the resource can't be mined and claiming does nothing
    // cooldown is tracked in the MineableAtComponent
    P_MotherlodeResourceComponent motherlodeResourceComponent = P_MotherlodeResourceComponent(
      world.getComponent(P_MotherlodeResourceComponentID)
    );

    // TITANIUM
    // SMALL
    ResourceValue memory ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );

    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.TITANIUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // IRIDIUM

    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.IRIDIUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // PLATINUM
    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.PLATINUM), uint256(EMotherlodeSize.LARGE)),
      ore
    );
    // KIMBERLITE
    // SMALL
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.SMALL)),
      ore
    );
    // MEDIUM
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.MEDIUM)),
      ore
    );
    // LARGE
    ore = ResourceValue({ resource: IronResourceItemID, value: 500 });
    motherlodeResourceComponent.set(
      LibEncode.hashKeyEntity(uint256(EMotherlodeType.KIMBERLITE), uint256(EMotherlodeSize.LARGE)),
      ore
    );
  }
}
