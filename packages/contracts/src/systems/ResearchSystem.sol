// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { FastMinerResearchComponent, ID as FastMinerResearchComponentID } from "components/FastMinerResearchComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";

uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 researchItem = abi.decode(arguments, (uint256));

    // determine what research item it is
    // if it's fast miner, then set the fast miner research component to true
    if (researchItem == FastMinerResearchComponentID) {
      FastMinerResearchComponent c = FastMinerResearchComponent(
        getAddressById(components, FastMinerResearchComponentID)
      );

      if (c.has(addressToEntity(msg.sender)) && c.getValue(addressToEntity(msg.sender))) {
        return abi.encode(false);
      }

      console.log("has entity");

      // require 100 iron and 100 copper
      CopperResourceComponent copperResourceComponent = CopperResourceComponent(
        getAddressById(components, CopperResourceComponentID)
      );
      IronResourceComponent ironResourceComponent = IronResourceComponent(
        getAddressById(components, IronResourceComponentID)
      );

      uint256 curCopper = copperResourceComponent.has(addressToEntity(msg.sender))
        ? copperResourceComponent.getValue(addressToEntity(msg.sender))
        : 0;
      uint256 curIron = ironResourceComponent.has(addressToEntity(msg.sender))
        ? ironResourceComponent.getValue(addressToEntity(msg.sender))
        : 0;

      if (curCopper < 100 || curIron < 100) {
        return abi.encode(false);
      } else {
        copperResourceComponent.set(addressToEntity(msg.sender), curCopper - 100);
        ironResourceComponent.set(addressToEntity(msg.sender), curIron - 100);

        c.set(addressToEntity(msg.sender));
        return abi.encode(true);
      }
    } else {
      return abi.encode(false);
    }
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
