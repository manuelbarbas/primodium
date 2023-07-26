pragma solidity >=0.8.0;
// Production Buildings
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";

library LibStorage {
  function getAvailableSpaceInStorageForResource(
    Uint32Component storageComponent,
    Uint32Component itemComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint32) {
    uint32 currentMaxStorage = getEntityMaxStorageForResource(storageComponent, entity, resourceId);
    uint32 currentOccupiedStorage = LibMath.getSafeUint32Value(
      itemComponent,
      LibEncode.hashKeyEntity(resourceId, entity)
    );
    if (currentMaxStorage <= currentOccupiedStorage) return 0;
    return currentMaxStorage - currentOccupiedStorage;
  }

  function getEntityMaxStorageForResource(
    Uint32Component storageComponent,
    uint256 entity,
    uint256 resourceId
  ) internal view returns (uint32) {
    return LibMath.getSafeUint32Value(storageComponent, LibEncode.hashKeyEntity(resourceId, entity));
  }
}
