// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { P_IsTechComponent, ID as P_IsTechComponentID } from "components/P_IsTechComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { LibResearch } from "libraries/LibResearch.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

import { ExpansionKey } from "src/prototypes.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";

uint256 constant ID = uint256(keccak256("system.UpgradeRange"));

contract UpgradeRangeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory) public override returns (bytes memory) {
    uint256 playerEntity = addressToEntity(msg.sender);

    uint32 playerLevel = LevelComponent(getC(LevelComponentID)).getValue(playerEntity);
    uint256 researchItem = LibEncode.hashKeyEntity(ExpansionKey, playerLevel + 1);
    P_IsTechComponent isTechComponent = P_IsTechComponent(getAddressById(components, P_IsTechComponentID));

    require(isTechComponent.has(researchItem), "[UpgradeRangeSystem] Technology not registered");

    require(
      LibResearch.checkMainBaseLevelRequirement(world, playerEntity, researchItem),
      "[UpgradeRangeSystem] MainBase level requirement not met"
    );

    if (P_RequiredResourcesComponent(getAddressById(components, P_RequiredResourcesComponentID)).has(researchItem)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, researchItem, 1),
        "[UpgradeRangeSystem] Not enough resources to research"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        researchItem
      );
    }

    LevelComponent(getC(LevelComponentID)).set(playerEntity, playerLevel + 1);
    HasResearchedComponent(getAddressById(components, HasResearchedComponentID)).set(
      LibEncode.hashKeyEntity(researchItem, playerEntity)
    );

    return abi.encode(true);
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode());
  }
}
