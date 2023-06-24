// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";

import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
// debug buildings
import { PlatingFactoryID,MainBaseID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID, SiloID } from "../prototypes/Tiles.sol";

import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";



import { Coord } from "../types.sol";
import { LibBuild } from "../libraries/LibBuild.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";

uint256 constant ID = uint256(keccak256("system.GodMode"));

contract GodModeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}


  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(args, (uint256, Coord));
   

  }

  function gainResourceOfAmountTyped(uint256 resourceId, uint256 amount ) public returns (bytes memory) {
    if(!LibDebug.isDebug())
    {
      revert("Not in debug mode");
    }
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    itemComponent.set(LibEncode.hashFromAddress(resourceId, msg.sender), itemComponent.getValue(LibEncode.hashFromAddress(resourceId, msg.sender)) + amount);
    return abi.encode(itemComponent.getValue(LibEncode.hashFromAddress(resourceId, msg.sender)));
  }

  function upgradeBuilding(uint256 buildingEntity) public returns (bytes memory) {
    if(!LibDebug.isDebug())
    {
      revert("Not in debug mode");
    }
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    itemComponent.set(LibEncode.hashFromAddress(resourceId, msg.sender), itemComponent.getValue(LibEncode.hashFromAddress(resourceId, msg.sender)) + amount);
  }




}