// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { HasResearchedComponent, ID as HasResearchedComponentID } from "components/HasResearchedComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";

import { BuildingKey } from "../prototypes.sol";

import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
uint256 constant ID = uint256(keccak256("system.ClaimFromMine"));

contract ClaimFromMineSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    // Components
    uint256 playerEntity = addressToEntity(msg.sender);

    Coord memory coord = abi.decode(args, (Coord));

    // check if main base
    uint256 entity = getBuildingFromCoord(coord);
    require(
      BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).has(entity),
      "[ClaimFromMineSystem] Cannot claim from mines on an empty coordinate"
    );

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = OwnedByComponent(getAddressById(components, OwnedByComponentID)).getValue(entity);
    require(
      ownedEntityAtStartCoord == playerEntity,
      "[ClaimFromMineSystem] Cannot claim from mines on a tile you do not own"
    );

    // Check that health is not zero
    require(
      LibHealth.checkAlive(HealthComponent(getAddressById(components, HealthComponentID)), entity),
      "[ClaimFromMineSystem] Cannot claim from mines on a tile with zero health"
    );

    LibNewMine.claimResourcesFromMines(world, playerEntity);

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
