// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { _erc20SystemId } from "@latticexyz/world-modules/src/modules/erc20-puppet/utils.sol";
import { Puppet } from "@latticexyz/world-modules/src/modules/puppet/Puppet.sol";

import { IERC20 } from "@latticexyz/world-modules/src/modules/erc20-puppet/IERC20.sol";

import { P_GameConfig2 } from "codegen/index.sol";

function transferToken(
  address worldAddress,
  address to,
  uint256 value
) {
  bytes memory callData = abi.encodeCall(IERC20.transfer, (to, value));
  address token = P_GameConfig2.getWETHAddress();
  (bool success, bytes memory data) = worldAddress.delegatecall(
    abi.encodeCall(IBaseWorld(worldAddress).call, (Puppet(token).systemId(), callData))
  );

  if (!success) revertWithBytes(data);
}
