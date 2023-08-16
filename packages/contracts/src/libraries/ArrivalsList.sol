// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ArrivalComponent, ID as ArrivalComponentID } from "components/ArrivalComponent.sol";
import { ArrivalsIndexComponent, ID as ArrivalsIndexComponentID } from "components/ArrivalsIndexComponent.sol";
import { ArrivalsSizeComponent, ID as ArrivalsSizeComponentID } from "components/ArrivalsSizeComponent.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Arrival } from "src/types.sol";

library ArrivalsList {
  function add(IWorld world, uint256 listId, Arrival memory arrival) internal {
    ArrivalsSizeComponent arrivalsSizeComponent = ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID));

    uint256 size = LibMath.getSafe(arrivalsSizeComponent, listId);

    uint256 listSizeIndex = LibEncode.hashKeyEntity(listId, size);
    ArrivalsIndexComponent(world.getComponent(ArrivalsIndexComponentID)).set(
      listSizeIndex,
      uint256(keccak256(abi.encode(arrival)))
    );
    arrivalsSizeComponent.set(listId, size + 1);
  }

  function get(IWorld world, uint256 listId, uint256 index) internal view returns (Arrival memory) {
    ArrivalsSizeComponent arrivalsSizeComponent = ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID));
    uint256 size = LibMath.getSafe(arrivalsSizeComponent, listId);
    require(index < size, "Index out of bounds");

    uint256 listIndex = LibEncode.hashKeyEntity(listId, index);
    uint256 arrivalKey = ArrivalsIndexComponent(world.getComponent(ArrivalsIndexComponentID)).getValue(listIndex);
    return ArrivalComponent(world.getComponent(ArrivalComponentID)).getValue(arrivalKey);
  }

  function getArrivalTime(IWorld world, uint256 listId, uint256 index) internal view returns (uint256) {
    return get(world, listId, index).arrivalBlock;
  }

  function remove(IWorld world, uint256 listId, uint256 index) internal {
    ArrivalsSizeComponent arrivalsSizeComponent = ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID));
    ArrivalsIndexComponent arrivalsIndexComponent = ArrivalsIndexComponent(
      world.getComponent(ArrivalsIndexComponentID)
    );
    uint256 size = LibMath.getSafe(arrivalsSizeComponent, listId);

    require(index < size, "Index out of bounds");

    uint256 finalListIndex = LibEncode.hashKeyEntity(listId, size - 1);
    uint256 lastKey = arrivalsIndexComponent.getValue(finalListIndex);
    uint256 listIndex = LibEncode.hashKeyEntity(listId, index);
    uint256 key = arrivalsIndexComponent.getValue(listIndex);

    arrivalsIndexComponent.set(listIndex, lastKey);
    ArrivalComponent(world.getComponent(ArrivalComponentID)).remove(key);
    arrivalsSizeComponent.set(listId, size - 1);
  }

  function length(IWorld world, uint256 listId) internal view returns (uint256) {
    return LibMath.getSafe(ArrivalsSizeComponent(world.getComponent(ArrivalsSizeComponentID)), listId);
  }
}
