pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

uint256 constant ID = uint256(keccak256("system.DebugRemoveBuildLimit"));

uint32 constant BIGNUM = 1_294_967_295;

contract DebugRemoveBuildLimitSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    if (!LibDebug.isDebug(world)) {
      revert("Not in debug mode");
    }
    MaxBuildingsComponent maxBuildings = MaxBuildingsComponent(getAddressById(components, MaxBuildingsComponentID));
    for (uint256 i = 0; i < 100; i++) {
      maxBuildings.set(i, BIGNUM);
    }
    return abi.encode(maxBuildings.getValue(0));
  }

  function executeTyped() public returns (bytes memory) {
    return execute(abi.encode(0));
  }
}
