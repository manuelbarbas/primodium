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
import { CopperResourceComponent, ID as CopperResourceComponentID } from "../../components/CopperResourceComponent.sol";
import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "../../components/BulletCraftedComponent.sol";

// import { MainBaseID, ConveyerID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, ConveyerID, MinerID, BulletFactoryID, SiloID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { Coord, VoxelCoord } from "../../types.sol";

contract AttackSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  // adapted from testClaimFactoryCraft
  function testSiloStorage() public {
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

    // Build a silo instead of a main base
    Coord memory siloCoord = Coord({ x: 0, y: 0 });
    bytes memory siloEntity = buildSystem.executeTyped(SiloID, siloCoord);
    uint256 siloID = abi.decode(siloEntity, (uint256));

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

    claimSystem.executeTyped(siloCoord);
    assertEq(ironResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(copperResourceComponent.getValue(bulletFactoryID), 0);
    assertEq(bulletCraftedComponent.getValue(bulletFactoryID), 0);

    assertEq(ironResourceComponent.getValue(siloID), 0);
    assertEq(copperResourceComponent.getValue(siloID), 100);
    assertEq(bulletCraftedComponent.getValue(siloID), 300);

    vm.stopPrank();
  }
}
