// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { SingletonID } from "solecs/SingletonID.sol";
import "solecs/Component.sol";

uint256 constant ID = uint256(keccak256("component.GameConfig"));

import { GameConfig } from "src/types.sol";

contract GameConfigComponent is Component {
  constructor(address world) Component(world, ID) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](4);
    values = new LibTypes.SchemaValue[](4);

    keys[0] = "moveSpeed";
    values[0] = LibTypes.SchemaValue.UINT32;

    keys[1] = "motherlodeDistance";
    values[1] = LibTypes.SchemaValue.UINT32;

    keys[2] = "maxMotherlodesPerAsteroid";
    values[2] = LibTypes.SchemaValue.UINT32;

    keys[3] = "motherlodeChanceInv";
    values[3] = LibTypes.SchemaValue.UINT32;
  }

  function set(uint256 entity, GameConfig calldata config) public {
    set(entity, encodedValue(config));
  }

  function getValue(uint256 entity) public view returns (GameConfig memory) {
    (uint32 moveSpeed, uint32 motherlodeDistance, uint32 maxMotherlodesPerAsteroid, uint32 motherlodeChanceInv) = abi
      .decode(getRawValue(entity), (uint32, uint32, uint32, uint32));
    return
      GameConfig({
        moveSpeed: moveSpeed,
        motherlodeDistance: motherlodeDistance,
        maxMotherlodesPerAsteroid: maxMotherlodesPerAsteroid,
        motherlodeChanceInv: motherlodeChanceInv
      });
  }

  function getEntitiesWithValue(GameConfig calldata config) public view returns (uint256[] memory) {
    return getEntitiesWithValue(encodedValue(config));
  }

  function encodedValue(GameConfig calldata config) private pure returns (bytes memory) {
    return
      abi.encode(
        config.moveSpeed,
        config.motherlodeDistance,
        config.maxMotherlodesPerAsteroid,
        config.motherlodeChanceInv
      );
  }
}
