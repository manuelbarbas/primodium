pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibDebug } from "../libraries/LibDebug.sol";

uint256 constant ID = uint256(keccak256("system.DebugSetBlueprintForBuildingType"));

contract DebugSetBlueprintForBuildingTypeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    if (!LibDebug.isDebug(world)) {
      revert("Not in debug mode");
    }
    (uint256 buildingId, int32[] memory blueprint) = abi.decode(args, (uint256, int32[]));
    BlueprintComponent blueprintComponent = BlueprintComponent(getAddressById(components, BlueprintComponentID));
    blueprintComponent.set(buildingId, blueprint);
    return abi.encode(buildingId, blueprint);
  }

  function executeTyped(uint256 buildingId, int32[] memory blueprint) public returns (bytes memory) {
    return execute(abi.encode(buildingId, blueprint));
  }
}
