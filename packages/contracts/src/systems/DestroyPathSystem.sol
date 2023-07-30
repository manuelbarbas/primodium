// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MainBaseID } from "../prototypes.sol";
import { BuildingKey } from "../prototypes.sol";
import { ID as PostDestroyPathSystemID } from "./PostDestroyPathSystem.sol";
import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.DestroyPath"));

contract DestroyPathSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coordStart = abi.decode(args, (Coord));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    // Check that the coordinates exist tiles
    uint256 startCoordEntity = getBuildingFromCoord(coordStart);
    require(
      buildingTypeComponent.has(startCoordEntity),
      "[DestroyPathSystem] Cannot destroy path from an empty coordinate"
    );

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(startCoordEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[DestroyPathSystem] Cannot destroy path from a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(ownedByComponent.has(startCoordEntity), "[DestroyPathSystem] Path does not exist at the selected tile");

    IOnEntitySubsystem(getAddressById(world.systems(), PostDestroyPathSystemID)).executeTyped(
      msg.sender,
      startCoordEntity
    );

    pathComponent.remove(startCoordEntity);

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart) public returns (bytes memory) {
    return execute(abi.encode(coordStart));
  }
}
