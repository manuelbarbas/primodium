pragma solidity >=0.8.0;
// Production Buildings
import { MainBaseID } from "../prototypes/Tiles.sol";

import { LibDebug } from "libraries/LibDebug.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress } from "solecs/utils.sol";
import { LibTerrain } from "libraries/LibTerrain.sol";

library LibPath {
  function checkCanBuildPath(
    Uint256Component tileComponent,
    Uint256Component mineComponent,
    Uint256Component storageComponent,
    Uint256Component buildingComponent,
    uint256 fromEntity,
    uint256 toEntity,
    uint256 playerEntity
  ) internal view returns (bool) {
    if (tileComponent.getValue(toEntity) != MainBaseID) {
      return false;
    }
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    if (!storageComponent.has(playerResourceStorageEntity)) {
      return false;
    }
    return
      mineComponent.has(
        LibEncode.hashKeyEntity(tileComponent.getValue(fromEntity), buildingComponent.getValue(fromEntity))
      );
  }
}
