// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { FastMinerResearchComponent, ID as FastMinerResearchComponentID } from "components/FastMinerResearchComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { LibResearch } from "libraries/LibResearch.sol";

uint256 constant ID = uint256(keccak256("system.Research"));

contract ResearchSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    uint256 researchItem = abi.decode(arguments, (uint256));

    // require 100 iron and 100 copper
    CopperResourceComponent copperResourceComponent = CopperResourceComponent(
      getAddressById(components, CopperResourceComponentID)
    );
    IronResourceComponent ironResourceComponent = IronResourceComponent(
      getAddressById(components, IronResourceComponentID)
    );
    FastMinerResearchComponent fastMinerResearchComponent = FastMinerResearchComponent(
      getAddressById(components, FastMinerResearchComponentID)
    );

    // determine what research item it is
    // if it's fast miner, then set the fast miner research component to true
    if (researchItem == FastMinerResearchComponentID) {
      return
        LibResearch.researchFastMiner(
          ironResourceComponent,
          copperResourceComponent,
          fastMinerResearchComponent,
          addressToEntity(msg.sender)
        );
    } else {
      return abi.encode(false);
    }
  }

  function executeTyped(uint256 researchItem) public returns (bytes memory) {
    return execute(abi.encode(researchItem));
  }
}
