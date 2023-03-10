// SPDX-License-Identifier: GPL-3.0
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
import { CopperResourceComponent, ID as CopperResourceComponentID } from "../../components/CopperResourceComponent.sol";
import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "../../components/BulletCraftedComponent.sol";

// import { MainBaseID, ConveyerID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, ConveyerID, MinerID, BulletFactoryID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord, VoxelCoord } from "../../types.sol";

contract ClaimFactorySystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testClaimFactoryNoCraft() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimSystem claimSystem = ClaimSystem(system(ClaimSystemID));
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID);

    Coord memory bulletFactoryCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));
    buildSystem.executeTyped(ConveyerID, endPathCoord);
    buildSystem.executeTyped(ConveyerID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, coord);
    assertTrue(!ironResourceComponent.has(bulletFactoryID));

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertTrue(ironResourceComponent.has(bulletFactoryID));
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 100);

    vm.roll(20);
    claimSystem.executeTyped(bulletFactoryCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 200);

    vm.roll(30);
    claimSystem.executeTyped(bulletFactoryCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 300);

    vm.stopPrank();
  }

  function testClaimFactoryCraft() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimSystem claimSystem = ClaimSystem(system(ClaimSystemID));

    // Resource and crafted components
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));
    CopperResourceComponent copperResourceComponent = CopperResourceComponent(component(CopperResourceComponentID));
    BulletCraftedComponent bulletCraftedComponent = BulletCraftedComponent(component(BulletCraftedComponentID));

    // TEMP: current generation seed
    Coord memory IronCoord = Coord({ x: -5, y: 2 });
    Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(IronCoord), IronID);
    assertEq(LibTerrain.getTopLayerKey(CopperCoord), CopperID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    Coord memory bulletFactoryCoord = Coord({ x: -5, y: -4 });
    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));

    // Copper to BulletFactory
    buildSystem.executeTyped(ConveyerID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(ConveyerID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, CopperCoord);

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertTrue(ironResourceComponent.has(bulletFactoryID));
    assertTrue(copperResourceComponent.has(bulletFactoryID));
    assertTrue(bulletCraftedComponent.has(bulletFactoryID));

    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 100);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 0);

    // Iron to BulletFactory
    buildSystem.executeTyped(MinerID, IronCoord);
    buildSystem.executeTyped(ConveyerID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(ConveyerID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(20);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 100);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 100);

    // BulletFactory to MainBase
    buildSystem.executeTyped(ConveyerID, Coord({ x: -4, y: -4 }));
    buildSystem.executeTyped(ConveyerID, Coord({ x: -1, y: 0 }));
    buildPathSystem.executeTyped(Coord({ x: -4, y: -4 }), Coord({ x: -1, y: 0 }));

    vm.roll(30);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 100);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 200);

    vm.roll(40);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 100);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 300);

    claimSystem.executeTyped(mainBaseCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 0);

    assertTrue(ironResourceComponent.has(addressToEntity(alice)));
    assertTrue(copperResourceComponent.has(addressToEntity(alice)));
    assertTrue(bulletCraftedComponent.has(addressToEntity(alice)));

    assertEq(ironResourceComponent.getValue(addressToEntity(alice)), 0);
    assertEq(copperResourceComponent.getValue(addressToEntity(alice)), 100);
    assertEq(bulletCraftedComponent.getValue(addressToEntity(alice)), 300);

    vm.stopPrank();
  }

  function testClaimFactoryToFactory() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimSystem claimSystem = ClaimSystem(system(ClaimSystemID));
    IronResourceComponent ironResourceComponent = IronResourceComponent(component(IronResourceComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(coord), IronID);

    Coord memory bulletFactoryCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));
    buildSystem.executeTyped(ConveyerID, endPathCoord);
    buildSystem.executeTyped(ConveyerID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, coord);
    assertTrue(!ironResourceComponent.has(bulletFactoryID));

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    assertTrue(ironResourceComponent.has(bulletFactoryID));
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 100);

    // new bullet factory to transfer resources to
    Coord memory bulletFactory2Coord = Coord({ x: 0, y: 10 });
    Coord memory endPath2Coord = Coord({ x: 0, y: 9 });
    Coord memory startPath2Coord = Coord({ x: 0, y: 1 });

    bytes memory bulletFactory2Entity = buildSystem.executeTyped(BulletFactoryID, bulletFactory2Coord);
    uint256 bulletFactory2ID = abi.decode(bulletFactory2Entity, (uint256));
    buildSystem.executeTyped(ConveyerID, endPath2Coord);
    buildSystem.executeTyped(ConveyerID, startPath2Coord);
    buildPathSystem.executeTyped(startPath2Coord, endPath2Coord);

    // transfer iron from factory 1 to factory 2
    console.log("Block here? should be 10");
    console.log(block.number);

    claimSystem.executeTyped(bulletFactory2Coord);
    assertTrue(ironResourceComponent.has(bulletFactory2ID));
    assertEq(ironResourceComponent.getValue(bulletFactory2ID), 100);

    vm.roll(20);

    // no through claiming. factory 2 claim -> doesn't claim from mines connected to factory 1
    claimSystem.executeTyped(bulletFactory2Coord);
    assertTrue(ironResourceComponent.has(bulletFactory2ID));
    assertEq(ironResourceComponent.getValue(bulletFactory2ID), 100);

    vm.stopPrank();
  }
}
