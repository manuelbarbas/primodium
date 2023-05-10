// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "forge-std/console.sol";

import { Deploy } from "../Deploy.sol";
import { MudTest } from "std-contracts/test/MudTest.t.sol";
import { addressToEntity, entityToAddress } from "solecs/utils.sol";

import { BuildSystem, ID as BuildSystemID } from "../../systems/BuildSystem.sol";
import { BuildPathSystem, ID as BuildPathSystemID } from "../../systems/BuildPathSystem.sol";
import { ClaimFromMineSystem, ID as ClaimFromMineSystemID } from "../../systems/ClaimFromMineSystem.sol";
import { ClaimFromFactorySystem, ID as ClaimFromFactorySystemID } from "../../systems/ClaimFromFactorySystem.sol";
import { CraftSystem, ID as CraftSystemID } from "../../systems/CraftSystem.sol";

import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";

// import { MainBaseID, ConveyorID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, ConveyorID, MinerID, BulletFactoryID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { IronResourceItemID, CopperResourceItemID, BulletCraftedItemID } from "../../prototypes/Keys.sol";

import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibEncode } from "../../libraries/LibEncode.sol";
import { Coord } from "../../types.sol";

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
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    // ClaimFromFactorySystem claimFactorySystem = ClaimFromFactorySystem(system(ClaimFromFactorySystemID));
    CraftSystem craftSystem = CraftSystem(system(CraftSystemID));
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    // Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -5, y: 2 })), IronID);

    Coord memory bulletFactoryCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));
    buildSystem.executeTyped(ConveyorID, endPathCoord);
    buildSystem.executeTyped(ConveyorID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, Coord({ x: -5, y: 2 }));
    uint256 hashedBulletFactoryKey = LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactoryID));
    assertTrue(!itemComponent.has(hashedBulletFactoryKey));

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertTrue(itemComponent.has(hashedBulletFactoryKey));
    assertEq(itemComponent.getValue(hashedBulletFactoryKey), 100);

    vm.roll(20);
    claimSystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKey), 200);

    vm.roll(30);
    claimSystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKey), 300);

    vm.stopPrank();
  }

  function testClaimFactoryCraft() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ClaimFromFactorySystem claimFactorySystem = ClaimFromFactorySystem(system(ClaimFromFactorySystemID));
    CraftSystem craftSystem = CraftSystem(system(CraftSystemID));

    // Resource and crafted components
    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: current generation seed
    // Coord memory IronCoord = Coord({ x: -5, y: 2 });
    // Coord memory CopperCoord = Coord({ x: -10, y: -4 });
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -5, y: 2 })), IronID);
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -10, y: -4 })), CopperID);

    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    buildSystem.executeTyped(MainBaseID, mainBaseCoord);

    Coord memory bulletFactoryCoord = Coord({ x: -5, y: -4 });
    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));

    uint256 hashedBulletFactoryKeyIron = LibEncode.hashFromAddress(
      IronResourceItemID,
      entityToAddress(bulletFactoryID)
    );
    uint256 hashedBulletFactoryKeyCopper = LibEncode.hashFromAddress(
      CopperResourceItemID,
      entityToAddress(bulletFactoryID)
    );
    uint256 hashedBulletFactoryKeyBullet = LibEncode.hashFromAddress(
      BulletCraftedItemID,
      entityToAddress(bulletFactoryID)
    );

    // Copper to BulletFactory
    buildSystem.executeTyped(ConveyorID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, Coord({ x: -10, y: -4 }));

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);

    console.log(hashedBulletFactoryKeyIron);
    console.log(hashedBulletFactoryKeyCopper);
    console.log(hashedBulletFactoryKeyBullet);

    // all three values exist because they are set when we craft items in the factory in craftSystem.
    // even when there are no bullets
    assertTrue(itemComponent.has(hashedBulletFactoryKeyIron));
    assertTrue(itemComponent.has(hashedBulletFactoryKeyCopper));
    assertTrue(itemComponent.has(hashedBulletFactoryKeyBullet));

    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 0);

    // Iron to BulletFactory
    buildSystem.executeTyped(MinerID, Coord({ x: -5, y: 2 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(20);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 100);

    // BulletFactory to MainBase
    buildSystem.executeTyped(ConveyorID, Coord({ x: -4, y: -4 }));
    buildSystem.executeTyped(ConveyorID, Coord({ x: -1, y: 0 }));
    buildPathSystem.executeTyped(Coord({ x: -4, y: -4 }), Coord({ x: -1, y: 0 }));

    vm.roll(30);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 200);

    vm.roll(40);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 300);

    claimSystem.executeTyped(mainBaseCoord);
    claimFactorySystem.executeTyped(mainBaseCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 0);

    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, alice)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(CopperResourceItemID, alice)), 100);
    assertEq(itemComponent.getValue(LibEncode.hashFromAddress(BulletCraftedItemID, alice)), 300);

    vm.stopPrank();
  }

  function testClaimFactoryToFactory() public {
    vm.startPrank(alice);

    BuildSystem buildSystem = BuildSystem(system(BuildSystemID));
    BuildPathSystem buildPathSystem = BuildPathSystem(system(BuildPathSystemID));
    ClaimFromMineSystem claimSystem = ClaimFromMineSystem(system(ClaimFromMineSystemID));
    ClaimFromFactorySystem claimFactorySystem = ClaimFromFactorySystem(system(ClaimFromFactorySystemID));
    CraftSystem craftSystem = CraftSystem(system(CraftSystemID));

    ItemComponent itemComponent = ItemComponent(component(ItemComponentID));

    // TEMP: tile -5, 2 has iron according to current generation seed
    // Coord memory coord = Coord({ x: -5, y: 2 });
    assertEq(LibTerrain.getTopLayerKey(Coord({ x: -5, y: 2 })), IronID);

    Coord memory bulletFactoryCoord = Coord({ x: 0, y: 0 });
    Coord memory endPathCoord = Coord({ x: -1, y: 0 });
    Coord memory startPathCoord = Coord({ x: -5, y: 1 });

    bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(bulletFactoryEntity, (uint256));
    buildSystem.executeTyped(ConveyorID, endPathCoord);
    buildSystem.executeTyped(ConveyorID, startPathCoord);
    buildPathSystem.executeTyped(startPathCoord, endPathCoord);

    // TEMP: MINE_COUNT_PER_BLOCK = 10 regardless of miner
    // START CLAIMING
    vm.roll(0);

    buildSystem.executeTyped(MinerID, Coord({ x: -5, y: 2 }));
    // uint256 hashedBulletFactoryKey = LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactoryID));
    assertTrue(!itemComponent.has(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactoryID))));

    vm.roll(10);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertTrue(itemComponent.has(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactoryID))));
    assertEq(
      itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactoryID))),
      100
    );

    // new bullet factory to transfer resources to
    Coord memory bulletFactory2Coord = Coord({ x: 0, y: 10 });
    Coord memory endPath2Coord = Coord({ x: 0, y: 9 });
    Coord memory startPath2Coord = Coord({ x: 0, y: 1 });

    bytes memory bulletFactory2Entity = buildSystem.executeTyped(BulletFactoryID, bulletFactory2Coord);
    uint256 bulletFactory2ID = abi.decode(bulletFactory2Entity, (uint256));
    buildSystem.executeTyped(ConveyorID, endPath2Coord);
    buildSystem.executeTyped(ConveyorID, startPath2Coord);
    buildPathSystem.executeTyped(startPath2Coord, endPath2Coord);

    console.log(block.number);

    // transfer iron from mine to factory 2
    claimSystem.executeTyped(bulletFactory2Coord);
    claimFactorySystem.executeTyped(bulletFactory2Coord);
    // uint256 hashedBulletFactory2Key = LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactory2ID));
    assertTrue(itemComponent.has(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactory2ID))));
    assertEq(
      itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactory2ID))),
      100
    );

    vm.roll(20);

    // transfer iron from factory 1 to factory 2
    // no through claiming. factory 2 claim -> doesn't claim from mines connected to factory 1
    claimSystem.executeTyped(bulletFactory2Coord);
    claimFactorySystem.executeTyped(bulletFactory2Coord);
    assertTrue(itemComponent.has(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactory2ID))));
    assertEq(
      itemComponent.getValue(LibEncode.hashFromAddress(IronResourceItemID, entityToAddress(bulletFactory2ID))),
      100
    );

    vm.stopPrank();
  }
}
