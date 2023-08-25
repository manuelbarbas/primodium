// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById, entityToAddress } from "./internal/PrimodiumSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as S_UpdatePlayerSpaceRockSystemID } from "systems/S_UpdatePlayerSpaceRockSystem.sol";
// components
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
// libraries
import { LibReinforce } from "../libraries/LibReinforce.sol";

uint256 constant ID = uint256(keccak256("system.ReceiveReinforcement"));

contract ReceiveReinforcementSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity, uint256 arrivalIndex) public returns (bytes memory) {
    return execute(abi.encode(rockEntity, arrivalIndex));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 rockEntity, uint256 arrivalIndex) = abi.decode(args, (uint256, uint256));

    require(
      OwnedByComponent(getC(OwnedByComponentID)).getValue(rockEntity) == addressToEntity(msg.sender),
      "[ReceiveReinforcement]: only the owner of a rock can receive reinforcements"
    );

    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    if (ownedByComponent.has(rockEntity)) {
      IOnEntitySubsystem(getAddressById(world.systems(), S_UpdatePlayerSpaceRockSystemID)).executeTyped(
        entityToAddress(ownedByComponent.getValue(rockEntity)),
        rockEntity
      );
    } else {
      revert("[ReceiveReinforcement]: rockEntity has no owner");
    }

    LibReinforce.receiveReinforcementsFromArrival(world, addressToEntity(msg.sender), rockEntity, arrivalIndex);
    return abi.encode(rockEntity);
  }
}
