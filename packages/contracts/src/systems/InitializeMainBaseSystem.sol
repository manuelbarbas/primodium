// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.InitializeMainBase"));

contract InitializeMainBaseSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID),
      "InitializeMainBaseSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    MainBaseComponent mainBaseComponent = MainBaseComponent(getC(MainBaseComponentID));

    if (mainBaseComponent.has(playerEntity)) {
      revert("[BuildSystem] Cannot build more than one main base per wallet");
    } else {
      mainBaseComponent.set(playerEntity, buildingEntity);
    }
    return abi.encode(buildingEntity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
