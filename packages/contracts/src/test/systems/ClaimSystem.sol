// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";
import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../../components/PositionComponent.sol";
import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";

import { MainBaseID, ConveyerID, CopperID, LithiumMinerID } from "../../prototypes/Tiles.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord, VoxelCoord } from "../../types.sol";

contract BuildSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  uint256 miner1;
  uint256 miner2;

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);

    vm.stopPrank();
  }

  function testClaim() public {
    vm.startPrank(alice);

    // TEMP: tile -6, 3 has copper according to current generation seed
    Coord memory coord = Coord({ x: -6, y: 3 });
    console.log("TOP LAYER KEY");
    console.log(LibTerrain.getTopLayerKey(coord));
    // assertEq(LibTerrain.getTopLayerKey(coord), CopperID);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));

    // PositionComponent positionComponent = PositionComponent(component(PositionComponentID));
    // OwnedByComponent ownedByComponent = OwnedByComponent(component(OwnedByComponentID));

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -6, y: 2 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    buildSystem.executeTyped(ConveyerID, endPathCoord);
    buildSystem.executeTyped(ConveyerID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    buildSystem.executeTyped(LithiumMinerID, coord);

    vm.stopPrank();
  }
}
