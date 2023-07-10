pragma solidity >=0.8.0;
// Production Buildings
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

library LibStorage {
  function getAvailableSpaceInStorageForResource(
    Uint256Component storageComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint256) {
    uint256 currentStorageCapacity = getEntityStorageCapacityForResource(storageComponent, entity, resourceId);
    uint256 currentOccupiedStorage = LibMath.getSafeUint256Value(
      itemComponent,
      LibEncode.hashKeyEntity(resourceId, entity)
    );
    if (currentStorageCapacity <= currentOccupiedStorage) return 0;
    return currentStorageCapacity - currentOccupiedStorage;
  }

  function getEntityStorageCapacityForResource(
    Uint256Component storageComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint256) {
    return LibMath.getSafeUint256Value(storageComponent, LibEncode.hashKeyEntity(resourceId, entity));
  }
}
