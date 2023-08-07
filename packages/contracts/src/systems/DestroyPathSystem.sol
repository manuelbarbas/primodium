// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID, ResourceValues } from "components/RequiredConnectedProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "components/BuildingProductionComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MainBaseID } from "../prototypes.sol";
import { BuildingKey } from "../prototypes.sol";
import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { ID as UpdateConnectedRequiredProductionSystemID } from "./UpdateConnectedRequiredProductionSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";

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
    uint256 fromEntity = getBuildingFromCoord(coordStart);
    require(buildingTypeComponent.has(fromEntity), "[DestroyPathSystem] Cannot destroy path from an empty coordinate");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(fromEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[DestroyPathSystem] Cannot destroy path from a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(ownedByComponent.has(fromEntity), "[DestroyPathSystem] Path does not exist at the selected tile");

    uint256 toEntity = pathComponent.getValue(fromEntity);

    if (RequiredConnectedProductionComponent(getC(RequiredConnectedProductionComponentID)).has(toEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateConnectedRequiredProductionSystemID)).executeTyped(
        msg.sender,
        fromEntity,
        EActionType.Destroy
      );
    }

    if (
      BuildingProductionComponent(getAddressById(components, BuildingProductionComponentID)).has(
        LibEncode.hashKeyEntity(
          buildingTypeComponent.getValue(fromEntity),
          LevelComponent(getC(LevelComponentID)).getValue(fromEntity)
        )
      )
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateActiveStatusSystemID)).executeTyped(
        msg.sender,
        fromEntity,
        EActionType.Destroy
      );
    }
    pathComponent.remove(fromEntity);

    return abi.encode(fromEntity);
  }

  function executeTyped(Coord memory coordStart) public returns (bytes memory) {
    return execute(abi.encode(coordStart));
  }
}
