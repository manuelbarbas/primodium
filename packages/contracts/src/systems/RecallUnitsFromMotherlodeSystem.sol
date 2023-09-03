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
import { LibInvade } from "../libraries/LibInvade.sol";
import { LibUpdateSpaceRock } from "../libraries/LibUpdateSpaceRock.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
uint256 constant ID = uint256(keccak256("system.RecallUnitsFromMotherlode"));

contract RecallUnitsFromMotherlodeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity) public returns (bytes memory) {
    return execute(abi.encode(rockEntity));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 rockEntity = abi.decode(args, (uint256));
    uint256 playerEntity = addressToEntity(msg.sender);
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    require(
      ownedByComponent.has(rockEntity) && ownedByComponent.getValue(rockEntity) == addressToEntity(msg.sender),
      "RecallUnitsFromMotherlodeSystem: Only the owner of the rock can recall units"
    );
    IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystemID)).executeTyped(
      entityToAddress(ownedByComponent.getValue(rockEntity)),
      rockEntity
    );
    LibUpdateSpaceRock.moveUnitsFromTo(world, playerEntity, rockEntity, LibEncode.hashEntity(world, playerEntity));

    return abi.encode(rockEntity);
  }
}
