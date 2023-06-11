// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID } from "components/PositionComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { HealthComponent, ID as HealthComponentID } from "components/HealthComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";

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

uint256 constant ID = uint256(keccak256("system.ClaimFromFactory"));

contract ClaimFromFactorySystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function claimBuilding(Coord memory coord, uint256 originEntity, uint256 destination) public {
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (entitiesAtPosition.length == 1) {
      // Check that health is not zero
      require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");

      if (entitiesAtPosition[0] == originEntity) {
        // Prevent conveyor tiles to re-claim buildings that we originally started claiming from
        // if an infinite loop, the game will just run out of gas.
        return;
      }

      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // debug
      // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
      if (c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          BulletCraftedItemID,
          IronResourceItemID,
          CopperResourceItemID
        );
      }
      // Craft 1 IronPlate with 1 IronResource and 1 CopperResource in DebugPlatingFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == DebugPlatingFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          IronPlateCraftedItemID,
          IronResourceItemID,
          CopperResourceItemID
        );
      }
      // production
      // Craft 1 IronPlate with 10 IronResource in PlatingFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PlatingFactoryID) {
        LibMath.transferTwoItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          IronPlateCraftedItemID,
          IronResourceItemID
        );
      }
      // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BasicBatteryFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          BasicPowerSourceCraftedItemID,
          LithiumResourceItemID,
          IronResourceItemID
        );
      }
      // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KineticMissileFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          KineticMissileCraftedItemID,
          BasicPowerSourceCraftedItemID,
          TitaniumResourceItemID
        );
      }
      // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == DenseMetalRefineryID) {
        LibMath.transferTwoItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          RefinedOsmiumCraftedItemID,
          OsmiumResourceItemID
        );
      }
      // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == AdvancedBatteryFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          AdvancedPowerSourceCraftedItemID,
          RefinedOsmiumCraftedItemID,
          BasicPowerSourceCraftedItemID
        );
      }
      // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratorFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          PenetratingWarheadCraftedItemID,
          RefinedOsmiumCraftedItemID,
          AdvancedPowerSourceCraftedItemID
        );
      }
      // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratingMissileFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          PenetratingMissileCraftedItemID,
          PenetratingWarheadCraftedItemID,
          KineticMissileCraftedItemID
        );
      }
      // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighTempFoundryID) {
        LibMath.transferTwoItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          TungstenRodsCraftedItemID,
          TungstenResourceItemID
        );
      }
      // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PrecisionMachineryFactoryID) {
        LibMath.transferTwoItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          IridiumCrystalCraftedItemID,
          IridiumResourceItemID
        );
      }
      // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == IridiumDrillbitFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          IridiumDrillbitCraftedItemID,
          IridiumCrystalCraftedItemID,
          TungstenRodsCraftedItemID
        );
      }
      // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighEnergyLaserFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          LaserPowerSourceCraftedItemID,
          IridiumCrystalCraftedItemID,
          AdvancedPowerSourceCraftedItemID
        );
      }
      // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricWarheadFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          ThermobaricWarheadCraftedItemID,
          IridiumDrillbitCraftedItemID,
          LaserPowerSourceCraftedItemID
        );
      }
      // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricMissileFactoryID) {
        LibMath.transferThreeItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          ThermobaricMissileCraftedItemID,
          PenetratingMissileCraftedItemID,
          ThermobaricWarheadCraftedItemID
        );
      }
      // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KimberliteCatalystFactoryID) {
        LibMath.transferTwoItems(
          itemComponent,
          entitiesAtPosition[0],
          destination,
          KimberliteCrystalCatalystCraftedItemID,
          KimberliteResourceItemID
        );
      }
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
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (
      entitiesAtPosition.length == 1 &&
      (tileComponent.getValue(entitiesAtPosition[0]) == DebugNodeID ||
        tileComponent.getValue(entitiesAtPosition[0]) == NodeID)
    ) {
      // Check that health is not zero
      require(LibHealth.checkAlive(healthComponent, entitiesAtPosition[0]), "health is not zero");

      claimAdjacentBuildings(coord, originEntity, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyor tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimNodeTile(positionComponent.getValue(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyor nodes.
  function claimAdjacentNodeTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimNodeTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimNodeTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    Coord memory coord = abi.decode(args, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    require(
      entitiesAtPosition.length == 1,
      "[ClaimFromFactorySystem] Cannot claim from factories on an empty coordinate"
    );

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[ClaimFromFactorySystem] Cannot claim from factories on a tile you do not own"
    );

    // Check that health is not zero
    require(
      LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]),
      "[ClaimFromFactorySystem] Cannot claim from factories on a tile with zero health"
    );

    uint256 endClaimTime = block.number;
    c.lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

    // Check main base, if so destination is the wallet
    if (c.tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID) {
      claimAdjacentNodeTiles(coord, entitiesAtPosition[0], addressToEntity(msg.sender));
    }
    // store items in claimable factories or weapons store
    else if (LibClaim.isClaimableFactory(c.tileComponent.getValue(entitiesAtPosition[0]))) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentNodeTiles(coord, entitiesAtPosition[0], destination);
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
