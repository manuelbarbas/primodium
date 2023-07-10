// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

// Debug Buildings
import { MainBaseID, DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";

// Production Buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibHealth } from "../libraries/LibHealth.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibCraft } from "../libraries/LibCraft.sol";
import { LibClaim } from "../libraries/LibClaim.sol";
import { LibMine } from "../libraries/LibMine.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.ClaimFromFactory"));

contract ClaimFromFactorySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function claimBuilding(Coord memory coord, uint256 originEntity, uint256 destination) public {
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    uint256 entity = getBuildingFromCoord(coord);
    uint256 playerEntity = addressToEntity(msg.sender);

    if (!tileComponent.has(entity)) return;

    // Prevent conveyor tiles to re-claim buildings that we originally started claiming from
    // if an infinite loop, the game will just run out of gas.
    if (entity == originEntity) return;

    // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
    if (playerEntity != OwnedByComponent(getC(OwnedByComponentID)).getValue(entity)) return;

    require(LibHealth.checkAlive(HealthComponent(getC(HealthComponentID)), entity), "health is not zero");
    // debug
    // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
    uint256 buildingType = tileComponent.getValue(entity);
    if (buildingType == BulletFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        BulletCraftedItemID,
        IronResourceItemID,
        CopperResourceItemID
      );
    }
    // Craft 1 IronPlate with 1 IronResource and 1 CopperResource in DebugPlatingFactory
    else if (buildingType == DebugPlatingFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        IronPlateCraftedItemID,
        IronResourceItemID,
        CopperResourceItemID
      );
    }
    // production
    // Craft 1 IronPlate with 10 IronResource in PlatingFactory
    else if (buildingType == PlatingFactoryID) {
      LibMath.transferTwoItems(itemComponent, entity, destination, IronPlateCraftedItemID, IronResourceItemID);
    }
    // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
    else if (buildingType == BasicBatteryFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        BasicPowerSourceCraftedItemID,
        LithiumResourceItemID,
        IronResourceItemID
      );
    }
    // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
    else if (buildingType == KineticMissileFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        KineticMissileCraftedItemID,
        BasicPowerSourceCraftedItemID,
        TitaniumResourceItemID
      );
    }
    // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
    else if (buildingType == DenseMetalRefineryID) {
      LibMath.transferTwoItems(itemComponent, entity, destination, RefinedOsmiumCraftedItemID, OsmiumResourceItemID);
    }
    // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
    else if (buildingType == AdvancedBatteryFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        AdvancedPowerSourceCraftedItemID,
        RefinedOsmiumCraftedItemID,
        BasicPowerSourceCraftedItemID
      );
    }
    // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
    else if (buildingType == PenetratorFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        PenetratingWarheadCraftedItemID,
        RefinedOsmiumCraftedItemID,
        AdvancedPowerSourceCraftedItemID
      );
    }
    // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
    else if (buildingType == PenetratingMissileFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        PenetratingMissileCraftedItemID,
        PenetratingWarheadCraftedItemID,
        KineticMissileCraftedItemID
      );
    }
    // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
    else if (buildingType == HighTempFoundryID) {
      LibMath.transferTwoItems(itemComponent, entity, destination, TungstenRodsCraftedItemID, TungstenResourceItemID);
    }
    // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
    else if (buildingType == PrecisionMachineryFactoryID) {
      LibMath.transferTwoItems(itemComponent, entity, destination, IridiumCrystalCraftedItemID, IridiumResourceItemID);
    }
    // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
    else if (buildingType == IridiumDrillbitFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        IridiumDrillbitCraftedItemID,
        IridiumCrystalCraftedItemID,
        TungstenRodsCraftedItemID
      );
    }
    // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
    else if (buildingType == HighEnergyLaserFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        LaserPowerSourceCraftedItemID,
        IridiumCrystalCraftedItemID,
        AdvancedPowerSourceCraftedItemID
      );
    }
    // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
    else if (buildingType == ThermobaricWarheadFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        ThermobaricWarheadCraftedItemID,
        IridiumDrillbitCraftedItemID,
        LaserPowerSourceCraftedItemID
      );
    }
    // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
    else if (buildingType == ThermobaricMissileFactoryID) {
      LibMath.transferThreeItems(
        itemComponent,
        entity,
        destination,
        ThermobaricMissileCraftedItemID,
        PenetratingMissileCraftedItemID,
        ThermobaricWarheadCraftedItemID
      );
    }
    // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
    else if (buildingType == KimberliteCatalystFactoryID) {
      LibMath.transferTwoItems(
        itemComponent,
        entity,
        destination,
        KimberliteCrystalCatalystCraftedItemID,
        KimberliteResourceItemID
      );
    }
  }

  // pass in a coordinate of a path block, fetch all surrounding miners.
  function claimAdjacentBuildings(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimBuilding(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimBuilding(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  // pass in a coordinate of a conveyor block, which fetches all other
  function claimNodeTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256 entity = getBuildingFromCoord(coord);

    if (
      !tileComponent.has(entity) ||
      tileComponent.getValue(entity) == DebugNodeID ||
      tileComponent.getValue(entity) == NodeID
    ) return;

    // Check that health is not zero
    require(LibHealth.checkAlive(healthComponent, entity), "health is not zero");

    claimAdjacentBuildings(coord, originEntity, destination);

    // trace backwards to all paths that end at this tile.
    // since we want the paths that end at this tile, this current tile entityID is the value
    uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entity);

    // claim each conveyor tile connected to the current tile. keys are the start position.
    for (uint i = 0; i < endAtPositionPaths.length; i++) {
      // Get the tile position
      claimNodeTile(LibEncode.decodeCoordEntity(endAtPositionPaths[i]), originEntity, destination);
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyor nodes.
  function claimAdjacentNodeTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimNodeTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    // Components
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    // LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),

    Coord memory coord = abi.decode(args, (Coord));
    uint256 playerEntity = addressToEntity(msg.sender);

    // check if main base
    uint256 buildingEntity = getBuildingFromCoord(coord);
    require(
      tileComponent.has(buildingEntity),
      "[ClaimFromFactorySystem] Cannot claim from factories on an empty coordinate"
    );

    uint256 buildingType = tileComponent.getValue(buildingEntity);
    // Check that the coordinates is owned by the msg.sender
    uint256 owner = OwnedByComponent(getC(OwnedByComponentID)).getValue(buildingEntity);
    require(owner == playerEntity, "[ClaimFromFactorySystem] Cannot claim from factories on a tile you do not own");

    // Check that health is not zero
    require(
      LibHealth.checkAlive(HealthComponent(getC(HealthComponentID)), buildingEntity),
      "[ClaimFromFactorySystem] Cannot claim from factories on a tile with zero health"
    );

    LastClaimedAtComponent(getC(LastClaimedAtComponentID)).set(buildingEntity, block.number);

    // Check main base, if so destination is the wallet
    if (buildingType == MainBaseID) {
      claimAdjacentNodeTiles(coord, buildingEntity, playerEntity);
    }
    // store items in claimable factories or weapons store
    else if (LibClaim.isClaimableFactory(buildingType)) {
      claimAdjacentNodeTiles(coord, buildingEntity, buildingEntity);
    } else {
      revert("[ClaimFromFactorySystem] Cannot store items in selected tile");
    }

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
