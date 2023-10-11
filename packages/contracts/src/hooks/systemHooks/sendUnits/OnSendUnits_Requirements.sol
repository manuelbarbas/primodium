pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibSend } from "libraries/LibSend.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { ReversePosition } from "codegen/tables/ReversePosition.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock, Arrival } from "src/Types.sol";

contract OnSendUnits_Requirements is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    SendArgs memory sendArgs = abi.decode(args, (SendArgs));
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    bytes32 playerEntity = addressToEntity(msgSender);
    LibSend.checkMovementRules(origin, destination, playerEntity, sendArgs.to, sendArgs.sendType);
  }

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}
}
