// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/console.sol";
import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "../../components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "../../components/RequiredResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredTileComponent, ID as RequiredTileComponentID } from "components/RequiredTileComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, ResourceValue } from "components/FactoryProductionComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID, ResourceValue } from "components/PassiveResourceProductionComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID } from "components/RequiredPassiveResourceComponent.sol";
import { MaxLevelComponent, ID as MaxLevelComponentID } from "components/MaxLevelComponent.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import "libraries/LibInitBuildingPrototypes.sol";

import "../../types.sol";
import "../../prototypes.sol";
// in-game blocks/factories

import { LibEncode } from "../../libraries/LibEncode.sol";

contract LibInitBuildingPrototypesTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
  }

  function testBuildingsHaveCorrectRequirements() public {}
}
