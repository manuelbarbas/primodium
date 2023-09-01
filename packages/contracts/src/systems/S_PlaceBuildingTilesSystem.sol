// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { BuildingTileKey } from "../prototypes.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as SpawnSystemID } from "./SpawnSystem.sol";
// components
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { P_BlueprintComponent, ID as P_BlueprintComponentID } from "components/P_BlueprintComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { Coord, Bounds } from "../types.sol";

// libraries
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.S_PlaceBuildingTiles"));

contract S_PlaceBuildingTilesSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), SpawnSystemID),
      "S_PlaceBuildingTilesSystem: Only BuildSystem and SpawnSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));

    uint256 buildingType = BuildingTypeComponent(getC(BuildingTypeComponentID)).getValue(buildingEntity);
    Coord memory coord = PositionComponent(getC(PositionComponentID)).getValue(buildingEntity);
    int32[] memory blueprint = P_BlueprintComponent(getC(P_BlueprintComponentID)).getValue(buildingType);
    Bounds memory bounds = LibBuilding.getPlayerBounds(world, addressToEntity(playerAddress));

    uint256[] memory tiles = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1], 0);
      Coord memory absoluteCoord = Coord(coord.x + relativeCoord.x, coord.y + relativeCoord.y, coord.parent);
      tiles[i / 2] = placeBuildingTile(buildingEntity, bounds, absoluteCoord);
    }
    ChildrenComponent(getC(ChildrenComponentID)).set(buildingEntity, tiles);
  }

  function placeBuildingTile(
    uint256 buildingEntity,
    Bounds memory bounds,
    Coord memory coord
  ) private returns (uint256 tileEntity) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    tileEntity = LibEncode.hashKeyCoord(BuildingTileKey, coord);
    require(!ownedByComponent.has(tileEntity), "[BuildSystem] Cannot build tile on a non-empty coordinate");
    require(
      bounds.minX <= coord.x && bounds.minY <= coord.y && bounds.maxX >= coord.x && bounds.maxY >= coord.y,
      "[BuildSystem] Building out of bounds"
    );
    ownedByComponent.set(tileEntity, buildingEntity);
    PositionComponent(getC(PositionComponentID)).set(tileEntity, coord);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
