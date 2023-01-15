// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";
import "../libraries/LibTerrain.sol";

import { Coord } from "../types.sol";

struct TerrainTile {
  int32 x;
  int32 y;
  int32 id;
}

uint256 constant ID = uint256(keccak256("component.TerrainTile"));

contract TerrainTileComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](3);
    values = new LibTypes.SchemaValue[](3);

    keys[0] = "x";
    values[0] = LibTypes.SchemaValue.INT32;

    keys[1] = "y";
    values[1] = LibTypes.SchemaValue.INT32;

    keys[2] = "id";
    values[2] = LibTypes.SchemaValue.INT32;
  }

  function init(uint256 entity, Coord calldata value) public virtual {
    set(entity, abi.encode(
      TerrainTile(value.x, value.y, LibTerrain.getIdFromTerrain(LibTerrain.getTerrainTile(value)))
    ));
  }

  function set(uint256 entity, TerrainTile calldata value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (TerrainTile memory) {
    (int32 x, int32 y, int32 id) = abi.decode(getRawValue(entity), (int32, int32, int32));
    return TerrainTile(x, y, id);
  }

  function getEntitiesWithValue(TerrainTile calldata coord) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(coord));
  }
}
