pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as ResearchSystemID } from "./ResearchSystem.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "./UpdateUnclaimedResourcesSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { RequiredResourcesComponent, ID as RequiredResourcesComponentID, ResourceValues } from "../components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.SpendRequiredResources"));

contract SpendRequiredResourcesSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), ResearchSystemID),
      "SpendRequiredResourcesSystem: Only BuildSystem, UpgradeSystem, ResearchSystem can call this function"
    );

    (address playerAddress, uint256 targetEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      world.getComponent(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    if (!requiredResourcesComponent.has(targetEntity)) abi.encode(playerAddress, targetEntity);
    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(targetEntity);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint256 playerResourceHash = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
      IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
        playerAddress,
        requiredResources.resources[i]
      );
      uint32 currItem = LibMath.getSafe(itemComponent, playerResourceHash);
      itemComponent.set(playerResourceHash, currItem - requiredResources.values[i]);
    }

    return abi.encode(playerAddress, targetEntity);
  }

  function executeTyped(address playerAddress, uint256 targetEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, targetEntity));
  }
}
