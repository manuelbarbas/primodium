pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

uint256 constant ID = uint256(keccak256("system.DebugRemoveBuildLimit"));

uint32 constant MAX_UINT32 = 4_294_967_295;

contract DebugRemoveBuildLimitSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    if (!LibDebug.isDebug(world)) {
      revert("Not in debug mode");
    }
    BuildingLimitComponent buildingLimit = BuildingLimitComponent(getAddressById(components, BuildingLimitComponentID));
    for (uint256 i = 0; i < 100; i++) {
      buildingLimit.set(i, MAX_UINT32);
    }
    return abi.encode(buildingLimit.getValue(0));
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(0));
  }
}
