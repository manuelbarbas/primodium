pragma solidity >=0.8.0;
import { EActionType } from "../types.sol";

interface IOnBuildingCountSubsystem {
  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType,
    uint32 count
  ) external returns (bytes memory);
}
