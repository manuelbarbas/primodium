// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";

import { Coord } from "../../types.sol";
import { BuildingTileKey } from "../../prototypes/Keys.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";

contract PrimodiumSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function getC(uint256 id) internal view returns (address) {
    return getAddressById(components, id);
  }

  function getBuildingFromCoord(Coord memory coord) internal view returns (uint256) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    uint256 buildingTile = LibEncode.encodeCoordEntity(coord, BuildingTileKey);
    if (!ownedByComponent.has(buildingTile)) return 0;
    return ownedByComponent.getValue(buildingTile);
  }

  function execute(bytes memory args) public virtual returns (bytes memory) {}
}
