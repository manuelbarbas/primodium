pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as SpawnSystemID } from "./SpawnSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as ResearchSystemID } from "./ResearchSystem.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "./S_UpdateUnclaimedResourcesSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnEntityCountSubsystem } from "../interfaces/IOnEntityCountSubsystem.sol";

import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID, ResourceValues } from "../components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.S_SpendRequiredResources"));

contract S_SpendRequiredResourcesSystem is IOnEntitySubsystem, IOnEntityCountSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), ResearchSystemID) ||
        msg.sender == getAddressById(world.systems(), SpawnSystemID),
      "S_SpendRequiredResourcesSystem: Only BuildSystem, UpgradeSystem, ResearchSystem can call this function"
    );

    (address playerAddress, uint256 targetEntity, uint32 count) = abi.decode(args, (address, uint256, uint32));
    uint256 playerEntity = addressToEntity(playerAddress);

    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
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
      itemComponent.set(playerResourceHash, currItem - (requiredResources.values[i] * count));
    }

    return abi.encode(playerAddress, targetEntity);
  }

  function executeTyped(address playerAddress, uint256 targetEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, targetEntity, uint32(1)));
  }

  function executeTyped(address playerAddress, uint256 targetEntity, uint32 count) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, targetEntity, count));
  }
}
