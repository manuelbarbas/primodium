// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";

// libraries
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";
import { LibInvade } from "../libraries/LibInvade.sol";
// types
import { Coord } from "../types.sol";
import { MainBaseID, BuildingKey } from "../prototypes.sol";

uint256 constant ID = uint256(keccak256("system.Invade"));

contract InvadeSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 rockEntity) public returns (bytes memory) {
    return execute(abi.encode(rockEntity));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    uint256 rockEntity = abi.decode(args, (uint256));
    LibInvade.invade(world, addressToEntity(msg.sender), rockEntity);
    return abi.encode(rockEntity);
  }
}
