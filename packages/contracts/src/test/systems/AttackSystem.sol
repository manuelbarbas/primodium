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
import { AttackSystem, ID as AttackSystemID } from "../../systems/AttackSystem.sol";

import { PathComponent, ID as PathComponentID } from "../../components/PathComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../../components/ItemComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

// import { MainBaseID, DebugNodeID, RegolithID, IronID, LithiumMinerID } from "../../prototypes/Tiles.sol";
import { MainBaseID, DebugNodeID, MinerID, BulletFactoryID, SiloID } from "../../prototypes/Tiles.sol";
import { WaterID, RegolithID, SandstoneID, AlluviumID, LithiumMinerID, BiofilmID, BedrockID, AirID, CopperID, LithiumID, IronID, TitaniumID, IridiumID, OsmiumID, TungstenID, KimberliteID, UraniniteID, BolutiteID } from "../../prototypes/Tiles.sol";

import { IronResourceItemID, CopperResourceItemID, BulletCraftedItemID } from "../../prototypes/Keys.sol";

import { LibEncode } from "../../libraries/LibEncode.sol";
import { LibTerrain } from "../../libraries/LibTerrain.sol";
import { LibHealth } from "../../libraries/LibHealth.sol";
import { LibAttack } from "../../libraries/LibAttack.sol";
import { Coord } from "../../types.sol";

contract AttackSystemTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
    vm.stopPrank();
  }

  function testSiloStorage() public {
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

    // Build a silo instead of a main base
    Coord memory mainBaseCoord = Coord({ x: 0, y: 0 });
    uint256 siloID = abi.decode(buildSystem.executeTyped(SiloID, mainBaseCoord), (uint256));

    Coord memory bulletFactoryCoord = Coord({ x: -5, y: -4 });
    // bytes memory bulletFactoryEntity = buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord);
    uint256 bulletFactoryID = abi.decode(buildSystem.executeTyped(BulletFactoryID, bulletFactoryCoord), (uint256));

    uint256 hashedBulletFactoryKeyIron = LibEncode.hashKeyEntity(
      IronResourceItemID,
      bulletFactoryID
    );
    uint256 hashedBulletFactoryKeyCopper = LibEncode.hashKeyEntity(
      CopperResourceItemID,
      bulletFactoryID
    );
    uint256 hashedBulletFactoryKeyBullet = LibEncode.hashKeyEntity(
      BulletCraftedItemID,
      bulletFactoryID
    );

    // Copper to BulletFactory
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -9, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -6, y: -4 }));
    buildPathSystem.executeTyped(Coord({ x: -9, y: -4 }), Coord({ x: -6, y: -4 }));

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
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: 1 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -5, y: -3 }));
    buildPathSystem.executeTyped(Coord({ x: -5, y: 1 }), Coord({ x: -5, y: -3 }));

    vm.roll(20);

    claimSystem.executeTyped(bulletFactoryCoord);
    claimFactorySystem.executeTyped(bulletFactoryCoord);
    craftSystem.executeTyped(bulletFactoryCoord);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyIron), 0);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyCopper), 100);
    assertEq(itemComponent.getValue(hashedBulletFactoryKeyBullet), 100);

    // BulletFactory to MainBase
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -4, y: -4 }));
    buildSystem.executeTyped(DebugNodeID, Coord({ x: -1, y: 0 }));
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

    assertEq(itemComponent.getValue(LibEncode.hashKeyEntity(IronResourceItemID, siloID)), 0);
    assertEq(itemComponent.getValue(LibEncode.hashKeyEntity(CopperResourceItemID, siloID)), 100);
    assertEq(itemComponent.getValue(LibEncode.hashKeyEntity(BulletCraftedItemID, siloID)), 300);

    vm.stopPrank();

    AttackSystem attackSystem = AttackSystem(system(AttackSystemID));
    HealthComponent healthComponent = HealthComponent(component(HealthComponentID));

    // build a mainbase for bob
    vm.startPrank(bob);
    // Coord memory bobMainBaseCoord = Coord({ x: 1, y: 1 });
    uint256 bobMainBaseID = abi.decode(buildSystem.executeTyped(MainBaseID, Coord({ x: 1, y: 1 })), (uint256));
    vm.stopPrank();

    // alice attacks bob's mainbase
    vm.startPrank(alice);
    uint8 attackedEntitiesCount = abi.decode(
      attackSystem.executeTyped(mainBaseCoord, Coord({ x: 1, y: 1 }), BulletCraftedItemID),
      (uint8)
    );

    assertEq(attackedEntitiesCount, 1, "should have attacked 1 entity");

    assertTrue(healthComponent.has(bobMainBaseID), "bob's mainbase should have health");
    assertEq(
      healthComponent.getValue(bobMainBaseID),
      LibHealth.getBuildingMaxHealth(MainBaseID) - LibAttack.getAttackDamage(BulletCraftedItemID),
      "bob's mainbase should have decreased by one attack damage"
    );

    attackSystem.executeTyped(mainBaseCoord, Coord({ x: 1, y: 1 }), BulletCraftedItemID);
    assertEq(
      healthComponent.getValue(bobMainBaseID),
      LibHealth.getBuildingMaxHealth(MainBaseID) -
        LibAttack.getAttackDamage(BulletCraftedItemID) -
        LibAttack.getAttackDamage(BulletCraftedItemID),
      "bob's mainbase should have decreased by two attack damage"
    );

    vm.stopPrank();
  }
}
