// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";

import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { P_UnitLevelUpgradeComponent, ID as P_UnitLevelUpgradeComponentID } from "components/P_UnitLevelUpgradeComponent.sol";
import { LibResearch } from "libraries/LibResearch.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibUtilityResource } from "libraries/LibUtilityResource.sol";
import { LibUnits } from "libraries/LibUnits.sol";
import { ResourceValue } from "../types.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";

uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 researchItem = abi.decode(args, (uint256));
    uint256 playerEntity = addressToEntity(msg.sender);

    P_IsTechComponent isTechComponent = P_IsTechComponent(getAddressById(components, P_IsTechComponentID));

    require(isTechComponent.has(researchItem), "[ResearchSystem] Technology not registered");

    P_UnitLevelUpgradeComponent unitLevelUpgradeComponent = P_UnitLevelUpgradeComponent(
      getAddressById(components, P_UnitLevelUpgradeComponentID)
    );

    require(
      LibBuilding.checkMainBaseLevelRequirement(world, playerEntity, researchItem),
      "[ResearchSystem] MainBase level requirement not met"
    );

    require(
      LibResearch.hasResearched(world, researchItem, playerEntity),
      "[ResearchSystem] Research requirements not met"
    );

    ResourceValue memory unitUpgrade;
    if (unitLevelUpgradeComponent.has(researchItem)) {
      unitUpgrade = unitLevelUpgradeComponent.getValue(researchItem);
      require(
        unitUpgrade.value == LibUnits.getPlayerUnitTypeLevel(world, playerEntity, unitUpgrade.resource) + 1,
        "[ResearchSystem] previous unit level not met"
      );
    }

    if (P_RequiredResourcesComponent(getAddressById(components, P_RequiredResourcesComponentID)).has(researchItem)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, researchItem, 1),
        "[ResearchSystem] Not enough resources to research"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        researchItem
      );
    }

    HasResearchedComponent(getAddressById(components, HasResearchedComponentID)).set(
      LibEncode.hashKeyEntity(researchItem, playerEntity)
    );

    P_UtilityProductionComponent utilityProductionComponent = P_UtilityProductionComponent(
      getAddressById(components, P_UtilityProductionComponentID)
    );
    if (utilityProductionComponent.has(researchItem)) {
      ResourceValue memory resourceValue = utilityProductionComponent.getValue(researchItem);
      LibUtilityResource.modifyMaxUtility(world, playerEntity, resourceValue.resource, resourceValue.value, true);
    }
    if (unitLevelUpgradeComponent.has(researchItem)) {
      LibUnits.setPlayerUnitTypeLevel(world, playerEntity, unitUpgrade.resource, unitUpgrade.value);
    }
    return abi.encode(true);
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
