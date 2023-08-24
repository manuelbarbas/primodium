// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "systems/S_UpdateUnclaimedResourcesSystem.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
uint256 constant ID = uint256(keccak256("system.ClaimFromMine"));

contract S_ClaimAllResourcesSystem is PrimodiumSystem, IOnSubsystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    // Components
    address playerAddress = abi.decode(args, (address));
    uint256 playerEntity = addressToEntity(playerAddress);

    LibResource.claimAllResources(world, playerEntity);

    return abi.encode(0);
  }

  function executeTyped(address playerAddress) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(playerAddress));
  }
}
