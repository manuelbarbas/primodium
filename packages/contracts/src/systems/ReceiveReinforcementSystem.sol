// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/console.sol";
// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
// libraries
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";
import { LibReinforce } from "../libraries/LibReinforce.sol";
// types
import { Coord } from "../types.sol";
import { MainBaseID, BuildingKey } from "../prototypes.sol";

uint256 constant ID = uint256(keccak256("system.ReceiveReinforcement"));

contract ReceiveReinforcementSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity, uint256 arrivalIndex) public returns (bytes memory) {
    return execute(abi.encode(rockEntity, arrivalIndex));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 rockEntity, uint256 arrivalIndex) = abi.decode(args, (uint256, uint256));

    console.log("executer: %s", addressToEntity(msg.sender));
    require(
      OwnedByComponent(getC(OwnedByComponentID)).getValue(rockEntity) == addressToEntity(msg.sender),
      "[ReceiveReinforcement]: only the owner of a rock can receive reinforcements"
    );
    LibReinforce.receiveReinforcementsFromArrival(world, addressToEntity(msg.sender), rockEntity, arrivalIndex);
    return abi.encode(rockEntity);
  }
}
