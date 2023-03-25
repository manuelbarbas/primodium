// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimSystem, ID as ClaimSystemID } from "../../systems/ClaimSystem.sol";

import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";

import { IronResourceComponent, ID as IronResourceComponentID } from "../../components/IronResourceComponent.sol";

// import { MainBaseID, ConveyerID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, ConveyerID, MinerID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord } from "../../types.sol";

contract ClaimSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testClaim() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimSystem claimSystem = ClaimSystem(system(ClaimSystemID));
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);
    buildSystem.executeTyped(ConveyerID, endPathCoord);
    buildSystem.executeTyped(ConveyerID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);
    buildSystem.executeTyped(MinerID, coord);

    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    assertTrue(ironResourceComponent.has(addressToEntity(alice)));
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 100);

    vm.roll(20);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 200);

    vm.roll(30);
    claimSystem.executeTyped(mainBaseCoord);
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 300);

    vm.stopPrank();
  }

  function testClaimDuplicatePaths() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimSystem claimSystem = ClaimSystem(system(ClaimSystemID));
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    Coord memory endPathCoord2 = Coord({ x: 0, y: 1 });
    Coord memory startPathCoord2 = Coord({ x: -4, y: 2 });

    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    buildSystem.executeTyped(ConveyerID, endPathCoord);
    buildSystem.executeTyped(ConveyerID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    buildSystem.executeTyped(ConveyerID, endPathCoord2);
    buildSystem.executeTyped(ConveyerID, startPathCoord2);
    buildPathSystem.executeTyped(startPathCoord2, endPathCoord2);

    vm.roll(0);
    buildSystem.executeTyped(MinerID, coord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    vm.roll(10);

    claimSystem.executeTyped(mainBaseCoord);
    assertTrue(ironResourceComponent.has(addressToEntity(alice)));
    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 100);

    vm.stopPrank();
  }
}
