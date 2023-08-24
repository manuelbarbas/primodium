// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById, entityToAddress } from "./internal/PrimodiumSystem.sol";

//systems
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as S_UpdatePlayerSpaceRockSystemID } from "systems/S_UpdatePlayerSpaceRockSystem.sol";

// components

import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
// libraries

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibInvade } from "../libraries/LibInvade.sol";

uint256 constant ID = uint256(keccak256("system.Invade"));

contract InvadeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity) public returns (bytes memory) {
    return execute(abi.encode(rockEntity));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 rockEntity = abi.decode(args, (uint256));

    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    if (ownedByComponent.has(rockEntity)) {
      IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystemID)).executeTyped(
        entityToAddress(ownedByComponent.getValue(rockEntity)),
        rockEntity
      );
    }
    LibInvade.invade(world, addressToEntity(msg.sender), rockEntity);
    return abi.encode(rockEntity);
  }
}
