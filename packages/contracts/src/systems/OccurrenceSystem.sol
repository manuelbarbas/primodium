// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { PositionComponent, ID as PositionComponentID } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LithiumID, RegolithID, SandstoneID, AlluviumID, WaterID } from "../prototypes/tiles.sol";
import { VoxelCoord } from "../utils.sol";

uint256 constant ID = uint256(keccak256("system.Occurrence"));

// This system is used to check whether a given block occurs at a given location.
// For blocks added after deployment of the core contracts, a new contract with a function
// returning the occurrence of that block can be deployed and linked with the block's Occurrence component.
contract OccurrenceSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public pure returns (bytes memory) {
    (uint256 blockType, VoxelCoord memory coord) = abi.decode(arguments, (uint256, VoxelCoord));

    if (blockType == LithiumID) return abi.encode(Lithium(coord));
    if (blockType == RegolithID) return abi.encode(Regolith(coord));
    if (blockType == SandstoneID) return abi.encode(Sandstone(coord));
    if (blockType == AlluviumID) return abi.encode(Alluvium(coord));
    if (blockType == WaterID) return abi.encode(Water(coord));
    return abi.encode(uint256(0));
  }

  function executeTyped(uint256 blockType, VoxelCoord memory coord) public pure returns (uint256) {
    return abi.decode(execute(abi.encode(blockType, coord)), (uint256));
  }

  // Occurence functions

  function Lithium(VoxelCoord memory coord) public pure returns (uint256) {
    return LibTerrain.Lithium(coord);
  }

  function Regolith(VoxelCoord memory coord) public pure returns (uint256) {
    return LibTerrain.Regolith(coord);
  }

  function Sandstone(VoxelCoord memory coord) public pure returns (uint256) {
    return LibTerrain.Sandstone(coord);
  }
    
  function Alluvium(VoxelCoord memory coord) public pure returns (uint256) {
    return LibTerrain.Alluvium(coord);
  }

   function Water(VoxelCoord memory coord) public pure returns (uint256) {
    return LibTerrain.Water(coord);
  }

}
