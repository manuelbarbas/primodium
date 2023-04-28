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

import { ResourceComponents } from "../prototypes/ResourceComponents.sol";
import { CraftedComponents } from "../prototypes/CraftedComponents.sol";
import { ClaimComponents } from "../prototypes/ClaimComponents.sol";
import { ResourceResearchComponents } from "../prototypes/ResourceResearchComponents.sol";

// Resource Components
import { BolutiteResourceComponent, ID as BolutiteResourceComponentID } from "components/BolutiteResourceComponent.sol";
import { CopperResourceComponent, ID as CopperResourceComponentID } from "components/CopperResourceComponent.sol";
import { IridiumResourceComponent, ID as IridiumResourceComponentID } from "components/IridiumResourceComponent.sol";
import { IronResourceComponent, ID as IronResourceComponentID } from "components/IronResourceComponent.sol";
import { KimberliteResourceComponent, ID as KimberliteResourceComponentID } from "components/KimberliteResourceComponent.sol";
import { LithiumResourceComponent, ID as LithiumResourceComponentID } from "components/LithiumResourceComponent.sol";
import { OsmiumResourceComponent, ID as OsmiumResourceComponentID } from "components/OsmiumResourceComponent.sol";
import { TitaniumResourceComponent, ID as TitaniumResourceComponentID } from "components/TitaniumResourceComponent.sol";
import { TungstenResourceComponent, ID as TungstenResourceComponentID } from "components/TungstenResourceComponent.sol";
import { UraniniteResourceComponent, ID as UraniniteResourceComponentID } from "components/UraniniteResourceComponent.sol";

// Crafted Components
import { IronPlateCraftedComponent, ID as IronPlateCraftedComponentID } from "components/IronPlateCraftedComponent.sol";
import { BasicPowerSourceCraftedComponent, ID as BasicPowerSourceCraftedComponentID } from "components/BasicPowerSourceCraftedComponent.sol";
import { KineticMissileCraftedComponent, ID as KineticMissileCraftedComponentID } from "components/KineticMissileCraftedComponent.sol";
import { RefinedOsmiumCraftedComponent, ID as RefinedOsmiumCraftedComponentID } from "components/RefinedOsmiumCraftedComponent.sol";
import { AdvancedPowerSourceCraftedComponent, ID as AdvancedPowerSourceCraftedComponentID } from "components/AdvancedPowerSourceCraftedComponent.sol";
import { PenetratingWarheadCraftedComponent, ID as PenetratingWarheadCraftedComponentID } from "components/PenetratingWarheadCraftedComponent.sol";
import { PenetratingMissileCraftedComponent, ID as PenetratingMissileCraftedComponentID } from "components/PenetratingMissileCraftedComponent.sol";
import { TungstenRodsCraftedComponent, ID as TungstenRodsCraftedComponentID } from "components/TungstenRodsCraftedComponent.sol";
import { IridiumCrystalCraftedComponent, ID as IridiumCrystalCraftedComponentID } from "components/IridiumCrystalCraftedComponent.sol";
import { IridiumDrillbitCraftedComponent, ID as IridiumDrillbitCraftedComponentID } from "components/IridiumDrillbitCraftedComponent.sol";
import { LaserPowerSourceCraftedComponent, ID as LaserPowerSourceCraftedComponentID } from "components/LaserPowerSourceCraftedComponent.sol";
import { ThermobaricWarheadCraftedComponent, ID as ThermobaricWarheadCraftedComponentID } from "components/ThermobaricWarheadCraftedComponent.sol";
import { ThermobaricMissileCraftedComponent, ID as ThermobaricMissileCraftedComponentID } from "components/ThermobaricMissileCraftedComponent.sol";
import { KimberliteCrystalCatalystCraftedComponent, ID as KimberliteCrystalCatalystCraftedComponentID } from "components/KimberliteCrystalCatalystCraftedComponent.sol";

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

// Debug Buildings
import { MainBaseID, ConveyorID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

// Production Buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// resources
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

// crafted

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

    ResourceComponents memory rc = ResourceComponents(
      BolutiteResourceComponent(getAddressById(components, BolutiteResourceComponentID)),
      CopperResourceComponent(getAddressById(components, CopperResourceComponentID)),
      IridiumResourceComponent(getAddressById(components, IridiumResourceComponentID)),
      IronResourceComponent(getAddressById(components, IronResourceComponentID)),
      KimberliteResourceComponent(getAddressById(components, KimberliteResourceComponentID)),
      LithiumResourceComponent(getAddressById(components, LithiumResourceComponentID)),
      OsmiumResourceComponent(getAddressById(components, OsmiumResourceComponentID)),
      TitaniumResourceComponent(getAddressById(components, TitaniumResourceComponentID)),
      TungstenResourceComponent(getAddressById(components, TungstenResourceComponentID)),
      UraniniteResourceComponent(getAddressById(components, UraniniteResourceComponentID))
    );

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

      // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
      if (c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
        BulletCraftedComponent bulletCraftedComponent = BulletCraftedComponent(
          getAddressById(components, BulletCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          rc.copperResourceComponent,
          rc.ironResourceComponent,
          bulletCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 IronPlate with 10 IronResource in PlatingFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PlatingFactoryID) {
        IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
          getAddressById(components, IronPlateCraftedComponentID)
        );
        LibMath.transferTwoComponents(
          rc.ironResourceComponent,
          ironPlateCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BasicBatteryFactoryID) {
        BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
          getAddressById(components, BasicPowerSourceCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          rc.lithiumResourceComponent,
          rc.ironResourceComponent,
          basicPowerSourceCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KineticMissileFactoryID) {
        BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
          getAddressById(components, BasicPowerSourceCraftedComponentID)
        );
        KineticMissileCraftedComponent kineticMissileCraftedComponent = KineticMissileCraftedComponent(
          getAddressById(components, KineticMissileCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          rc.titaniumResourceComponent,
          basicPowerSourceCraftedComponent,
          kineticMissileCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == DenseMetalRefineryID) {
        RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
          getAddressById(components, RefinedOsmiumCraftedComponentID)
        );
        LibMath.transferTwoComponents(
          rc.osmiumResourceComponent,
          refinedOsmiumCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == AdvancedBatteryFactoryID) {
        RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
          getAddressById(components, RefinedOsmiumCraftedComponentID)
        );
        BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
          getAddressById(components, BasicPowerSourceCraftedComponentID)
        );
        AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
          getAddressById(components, AdvancedPowerSourceCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          refinedOsmiumCraftedComponent,
          basicPowerSourceCraftedComponent,
          advancedPowerSourceCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratorFactoryID) {
        RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
          getAddressById(components, RefinedOsmiumCraftedComponentID)
        );
        AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
          getAddressById(components, AdvancedPowerSourceCraftedComponentID)
        );
        PenetratingWarheadCraftedComponent penetratingWarheadCraftedComponent = PenetratingWarheadCraftedComponent(
          getAddressById(components, PenetratingWarheadCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          refinedOsmiumCraftedComponent,
          advancedPowerSourceCraftedComponent,
          penetratingWarheadCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratingMissileFactoryID) {
        PenetratingWarheadCraftedComponent penetratingWarheadCraftedComponent = PenetratingWarheadCraftedComponent(
          getAddressById(components, PenetratingWarheadCraftedComponentID)
        );
        KineticMissileCraftedComponent kineticMissileCraftedComponent = KineticMissileCraftedComponent(
          getAddressById(components, KineticMissileCraftedComponentID)
        );
        PenetratingMissileCraftedComponent penetratingMissileCraftedComponent = PenetratingMissileCraftedComponent(
          getAddressById(components, PenetratingMissileCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          penetratingWarheadCraftedComponent,
          kineticMissileCraftedComponent,
          penetratingMissileCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighTempFoundryID) {
        TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
          getAddressById(components, TungstenRodsCraftedComponentID)
        );
        LibMath.transferTwoComponents(
          rc.tungstenResourceComponent,
          tungstenRodsCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PrecisionMachineryFactoryID) {
        IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
          getAddressById(components, IridiumCrystalCraftedComponentID)
        );
        LibMath.transferTwoComponents(
          rc.iridiumResourceComponent,
          iridiumCrystalCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == IridiumDrillbitFactoryID) {
        IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
          getAddressById(components, IridiumCrystalCraftedComponentID)
        );
        TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
          getAddressById(components, TungstenRodsCraftedComponentID)
        );
        IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
          getAddressById(components, IridiumDrillbitCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          iridiumCrystalCraftedComponent,
          tungstenRodsCraftedComponent,
          iridiumDrillbitCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighEnergyLaserFactoryID) {
        IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
          getAddressById(components, IridiumCrystalCraftedComponentID)
        );
        AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
          getAddressById(components, AdvancedPowerSourceCraftedComponentID)
        );
        LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
          getAddressById(components, LaserPowerSourceCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          iridiumCrystalCraftedComponent,
          advancedPowerSourceCraftedComponent,
          laserPowerSourceCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricWarheadFactoryID) {
        IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
          getAddressById(components, IridiumDrillbitCraftedComponentID)
        );
        LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
          getAddressById(components, LaserPowerSourceCraftedComponentID)
        );
        ThermobaricWarheadCraftedComponent thermobaricWarheadCraftedComponent = ThermobaricWarheadCraftedComponent(
          getAddressById(components, ThermobaricWarheadCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          iridiumDrillbitCraftedComponent,
          laserPowerSourceCraftedComponent,
          thermobaricWarheadCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricMissileFactoryID) {
        PenetratingMissileCraftedComponent penetratingMissileCraftedComponent = PenetratingMissileCraftedComponent(
          getAddressById(components, PenetratingMissileCraftedComponentID)
        );
        ThermobaricWarheadCraftedComponent thermobaricWarheadCraftedComponent = ThermobaricWarheadCraftedComponent(
          getAddressById(components, ThermobaricWarheadCraftedComponentID)
        );
        ThermobaricMissileCraftedComponent thermobaricMissileCraftedComponent = ThermobaricMissileCraftedComponent(
          getAddressById(components, ThermobaricMissileCraftedComponentID)
        );
        LibMath.transferThreeComponents(
          penetratingMissileCraftedComponent,
          thermobaricWarheadCraftedComponent,
          thermobaricMissileCraftedComponent,
          entitiesAtPosition[0],
          destination
        );
      }
      // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KimberliteCatalystFactoryID) {
        KimberliteCrystalCatalystCraftedComponent kimberliteCrystalCatalystCraftedComponent = KimberliteCrystalCatalystCraftedComponent(
            getAddressById(components, KimberliteCrystalCatalystCraftedComponentID)
          );
        LibMath.transferTwoComponents(
          rc.kimberliteResourceComponent,
          kimberliteCrystalCatalystCraftedComponent,
          entitiesAtPosition[0],
          destination
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
  function claimConveyorTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (
      entitiesAtPosition.length == 1 &&
      (tileComponent.getValue(entitiesAtPosition[0]) == ConveyorID ||
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
        claimConveyorTile(positionComponent.getValue(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyor nodes.
  function claimAdjacentConveyorTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimConveyorTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimConveyorTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimConveyorTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimConveyorTile(Coord(coord.x, coord.y - 1), originEntity, destination);
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
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], addressToEntity(msg.sender));
    }
    // store items in the Silo for emitting bullets
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == SiloID) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], destination);
    } else if (LibClaim.isClaimableFactory(c.tileComponent.getValue(entitiesAtPosition[0]))) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyorTiles(coord, entitiesAtPosition[0], destination);
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
