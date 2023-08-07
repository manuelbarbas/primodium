// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { BuildingTileKey } from "../prototypes.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "systems/UpdatePlayerStorageSystem.sol";
import { ID as UpdatePlayerResourceProductionSystemID } from "systems/UpdatePlayerResourceProductionSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "systems/SpendRequiredResourcesSystem.sol";
import { ID as ClaimFromMineSystemID } from "systems/ClaimFromMineSystem.sol";
// components
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PlaceBuildingTiles"));

contract PlaceBuildingTilesSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID),
      "PlaceBuildingTilesSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    uint256 buildingType = BuildingTypeComponent(getC(BuildingTypeComponentID)).getValue(buildingEntity);
    Coord memory coord = LibEncode.decodeCoordEntity(buildingEntity);
    int32[] memory blueprint = BlueprintComponent(getC(BlueprintComponentID)).getValue(buildingType);
    uint256[] memory tiles = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1]);
      tiles[i / 2] = placeBuildingTile(buildingEntity, coord, relativeCoord);
    }
    ChildrenComponent(getC(ChildrenComponentID)).set(buildingEntity, tiles);
    //  MainBaseID has a special condition called MainBase, so that each wallet only has one MainBase
  }

  function placeBuildingTile(
    uint256 buildingEntity,
    Coord memory baseCoord,
    Coord memory relativeCoord
  ) private returns (uint256 tileEntity) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    Coord memory coord = Coord(baseCoord.x + relativeCoord.x, baseCoord.y + relativeCoord.y);
    tileEntity = LibEncode.encodeCoordEntity(coord, BuildingTileKey);
    require(!ownedByComponent.has(tileEntity), "[BuildSystem] Cannot build tile on a non-empty coordinate");
    ownedByComponent.set(tileEntity, buildingEntity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
