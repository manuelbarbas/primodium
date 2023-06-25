pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

uint256 constant ID = uint256(keccak256("system.DebugIgnoreBuildLimitForBuilding"));

contract DebugIgnoreBuildLimitForBuildingSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    uint256 buildingId = abi.decode(args, (uint256));
    if (!LibDebug.isDebug()) {
      revert("Not in debug mode");
    }
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );
    ignoreBuildLimitComponent.set(buildingId);
    return abi.encode(ignoreBuildLimitComponent.getValue(buildingId));
  }

  function executeTyped(uint256 buildingId) public returns (bytes memory) {
    return execute(abi.encode(buildingId));
  }
}
