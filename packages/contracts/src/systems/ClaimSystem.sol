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

// Resource Research Components
import { CopperResearchComponent, ID as CopperResearchComponentID } from "components/CopperResearchComponent.sol";
import { LithiumResearchComponent, ID as LithiumResearchComponentID } from "components/LithiumResearchComponent.sol";
import { TitaniumResearchComponent, ID as TitaniumResearchComponentID } from "components/TitaniumResearchComponent.sol";
import { OsmiumResearchComponent, ID as OsmiumResearchComponentID } from "components/OsmiumResearchComponent.sol";
import { TungstenResearchComponent, ID as TungstenResearchComponentID } from "components/TungstenResearchComponent.sol";
import { IridiumResearchComponent, ID as IridiumResearchComponentID } from "components/IridiumResearchComponent.sol";
import { KimberliteResearchComponent, ID as KimberliteResearchComponentID } from "components/KimberliteResearchComponent.sol";

import { BulletCraftedComponent, ID as BulletCraftedComponentID } from "components/BulletCraftedComponent.sol";

// Debug Buildings
import { MainBaseID, ConveyerID, MinerID, LithiumMinerID, BulletFactoryID, SiloID } from "../prototypes/Tiles.sol";

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

uint256 constant ID = uint256(keccak256("system.Claim"));

contract ClaimSystem is System {
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

    ResourceResearchComponents memory rrc = ResourceResearchComponents(
      CopperResearchComponent(getAddressById(components, CopperResearchComponentID)),
      LithiumResearchComponent(getAddressById(components, LithiumResearchComponentID)),
      TitaniumResearchComponent(getAddressById(components, TitaniumResearchComponentID)),
      OsmiumResearchComponent(getAddressById(components, OsmiumResearchComponentID)),
      TungstenResearchComponent(getAddressById(components, TungstenResearchComponentID)),
      IridiumResearchComponent(getAddressById(components, IridiumResearchComponentID)),
      KimberliteResearchComponent(getAddressById(components, KimberliteResearchComponentID))
    );

    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    uint256 ownerKey = addressToEntity(msg.sender);

    if (entitiesAtPosition.length == 1) {
      // Check that health is not zero
      require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");

      if (entitiesAtPosition[0] == originEntity) {
        // Prevent conveyer tiles to re-claim buildings that we originally started claiming from
        // if an infinite loop, the game will just run out of gas.
        return;
      }

      // Check that the coordinates is owned by the msg.sender, "can not claim resource at not owned tile"
      uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
      if (ownedEntityAtStartCoord != ownerKey) {
        return;
      }

      // Miners
      if (
        c.tileComponent.getValue(entitiesAtPosition[0]) == MinerID ||
        c.tileComponent.getValue(entitiesAtPosition[0]) == BasicMinerID
      ) {
        // fetch tile beneath miner, return 0 if resource is not unlocked via LibMine.mine
        uint256 resourceKey = LibTerrain.getTopLayerKey(coord);
        uint256 incBy = LibMine.mine(rrc, c.lastClaimedAtComponent, resourceKey, entitiesAtPosition[0]);

        if (resourceKey == BolutiteID) {
          LibMath.incrementBy(rc.bolutiteResourceComponent, destination, incBy);
        } else if (resourceKey == CopperID) {
          LibMath.incrementBy(rc.copperResourceComponent, destination, incBy);
        } else if (resourceKey == IridiumID) {
          LibMath.incrementBy(rc.iridiumResourceComponent, destination, incBy);
        } else if (resourceKey == IronID) {
          LibMath.incrementBy(rc.ironResourceComponent, destination, incBy);
        } else if (resourceKey == KimberliteID) {
          LibMath.incrementBy(rc.kimberliteResourceComponent, destination, incBy);
        } else if (resourceKey == LithiumID) {
          LibMath.incrementBy(rc.lithiumResourceComponent, destination, incBy);
        } else if (resourceKey == OsmiumID) {
          LibMath.incrementBy(rc.osmiumResourceComponent, destination, incBy);
        } else if (resourceKey == TitaniumID) {
          LibMath.incrementBy(rc.titaniumResourceComponent, destination, incBy);
        } else if (resourceKey == TungstenID) {
          LibMath.incrementBy(rc.tungstenResourceComponent, destination, incBy);
        } else if (resourceKey == UraniniteID) {
          LibMath.incrementBy(rc.uraniniteResourceComponent, destination, incBy);
        }
        return;
      }
      // Craft 1 Bullet with 1 IronResource and 1 CopperResource in BulletFactory
      // special case for debug where recipe resources are transferred to the destination
      // staging for future factories once we can find a better strategy to reduce contract size.
      // see below for reference
      // https://github.com/primodiumxyz/primodium-mud/blob/f8bfc32baedbba555c500dc4c315376927690f66/packages/contracts/src/systems/ClaimSystem.sol#L166
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BulletFactoryID) {
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
      // Production factories, only transfer final crafted result.
      // Craft 1 IronPlate with 10 IronResource in PlatingFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PlatingFactoryID) {
        IronPlateCraftedComponent ironPlateCraftedComponent = IronPlateCraftedComponent(
          getAddressById(components, IronPlateCraftedComponentID)
        );
        LibMath.transfer(ironPlateCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 BasicPowerSource with 100 LithiumResource and 20 IronResource in BasicBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == BasicBatteryFactoryID) {
        BasicPowerSourceCraftedComponent basicPowerSourceCraftedComponent = BasicPowerSourceCraftedComponent(
          getAddressById(components, BasicPowerSourceCraftedComponentID)
        );
        LibMath.transfer(basicPowerSourceCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 KineticMissile with 10 BasicPowerSourceCrafted and 20 TitaniumResource in KineticMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KineticMissileFactoryID) {
        KineticMissileCraftedComponent kineticMissileCraftedComponent = KineticMissileCraftedComponent(
          getAddressById(components, KineticMissileCraftedComponentID)
        );
        LibMath.transfer(kineticMissileCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 RefinedOsmium with 10 OsmiumResource in DenseMetalRefinery
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == DenseMetalRefineryID) {
        RefinedOsmiumCraftedComponent refinedOsmiumCraftedComponent = RefinedOsmiumCraftedComponent(
          getAddressById(components, RefinedOsmiumCraftedComponentID)
        );
        LibMath.transfer(refinedOsmiumCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 AdvancedPowerSource with 10 RefinedOsmiumCrafted and 2 BasicPowerSourceCrafted in AdvancedBatteryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == AdvancedBatteryFactoryID) {
        AdvancedPowerSourceCraftedComponent advancedPowerSourceCraftedComponent = AdvancedPowerSourceCraftedComponent(
          getAddressById(components, AdvancedPowerSourceCraftedComponentID)
        );
        LibMath.transfer(advancedPowerSourceCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 PenetratingWarhead with 20 RefinedOsmiumCrafted and 5 AdvancedPowerSourceCrafted in PenetratorFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratorFactoryID) {
        PenetratingWarheadCraftedComponent penetratingWarheadCraftedComponent = PenetratingWarheadCraftedComponent(
          getAddressById(components, PenetratingWarheadCraftedComponentID)
        );
        LibMath.transfer(penetratingWarheadCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 PenetratingMissile with 1 PenetratingWarheadCrafted and 1 KineticMissileCrafted in PenetratingMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PenetratingMissileFactoryID) {
        PenetratingMissileCraftedComponent penetratingMissileCraftedComponent = PenetratingMissileCraftedComponent(
          getAddressById(components, PenetratingMissileCraftedComponentID)
        );
        LibMath.transfer(penetratingMissileCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 TungstenRods with 10 TungstenResource in HighTempFoundry
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighTempFoundryID) {
        TungstenRodsCraftedComponent tungstenRodsCraftedComponent = TungstenRodsCraftedComponent(
          getAddressById(components, TungstenRodsCraftedComponentID)
        );
        LibMath.transfer(tungstenRodsCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 IridiumCrystal with 10 IridiumResource in PrecisionMachineryFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == PrecisionMachineryFactoryID) {
        IridiumCrystalCraftedComponent iridiumCrystalCraftedComponent = IridiumCrystalCraftedComponent(
          getAddressById(components, IridiumCrystalCraftedComponentID)
        );
        LibMath.transfer(iridiumCrystalCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 IridiumDrillbit with 5 IridiumCrystalCrafted and 10 TungstenRodsCrafted in IridiumDrillbitFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == IridiumDrillbitFactoryID) {
        IridiumDrillbitCraftedComponent iridiumDrillbitCraftedComponent = IridiumDrillbitCraftedComponent(
          getAddressById(components, IridiumDrillbitCraftedComponentID)
        );
        LibMath.transfer(iridiumDrillbitCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 LaserPowerSource with 10 IridiumCrystalCrafted and 5 AdvancedPowerSource in HighEnergyLaserFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == HighEnergyLaserFactoryID) {
        LaserPowerSourceCraftedComponent laserPowerSourceCraftedComponent = LaserPowerSourceCraftedComponent(
          getAddressById(components, LaserPowerSourceCraftedComponentID)
        );
        LibMath.transfer(laserPowerSourceCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 ThermobaricWarhead with 1 IridiumDrillbitCrafted and 1 LaserPowerSourceCrafted in ThermobaricWarheadFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricWarheadFactoryID) {
        ThermobaricWarheadCraftedComponent thermobaricWarheadCraftedComponent = ThermobaricWarheadCraftedComponent(
          getAddressById(components, ThermobaricWarheadCraftedComponentID)
        );
        LibMath.transfer(thermobaricWarheadCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 ThermobaricMissile with 10 PenetratingMissileCrafted and 1 ThermobaricWarheadCrafted in ThermobaricMissileFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == ThermobaricMissileFactoryID) {
        ThermobaricMissileCraftedComponent thermobaricMissileCraftedComponent = ThermobaricMissileCraftedComponent(
          getAddressById(components, ThermobaricMissileCraftedComponentID)
        );
        LibMath.transfer(thermobaricMissileCraftedComponent, entitiesAtPosition[0], destination);
      }
      // Craft 1 KimberliteCrystalCatalyst with 10 KimberliteResource in KimberliteCatalystFactory
      else if (c.tileComponent.getValue(entitiesAtPosition[0]) == KimberliteCatalystFactoryID) {
        KimberliteCrystalCatalystCraftedComponent kimberliteCrystalCatalystCraftedComponent = KimberliteCrystalCatalystCraftedComponent(
            getAddressById(components, KimberliteCrystalCatalystCraftedComponentID)
          );
        LibMath.transfer(kimberliteCrystalCatalystCraftedComponent, entitiesAtPosition[0], destination);
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

  // pass in a coordinate of a conveyer block, which fetches all other
  function claimConveyerTile(Coord memory coord, uint256 originEntity, uint256 destination) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    HealthComponent healthComponent = HealthComponent(getAddressById(components, HealthComponentID));

    // check if tile component and connnect to previous path
    uint256[] memory entitiesAtPosition = positionComponent.getEntitiesWithValue(coord);

    if (
      entitiesAtPosition.length == 1 &&
      (tileComponent.getValue(entitiesAtPosition[0]) == ConveyerID ||
        tileComponent.getValue(entitiesAtPosition[0]) == NodeID)
    ) {
      // Check that health is not zero
      require(LibHealth.checkAlive(healthComponent, entitiesAtPosition[0]), "health is not zero");

      claimAdjacentBuildings(coord, originEntity, destination);

      // trace backwards to all paths that end at this tile.
      // since we want the paths that end at this tile, this current tile entityID is the value
      uint256[] memory endAtPositionPaths = pathComponent.getEntitiesWithValue(entitiesAtPosition[0]);

      // claim each conveyer tile connected to the current tile. keys are the start position.
      for (uint i = 0; i < endAtPositionPaths.length; i++) {
        // Get the tile position
        claimConveyerTile(positionComponent.getValue(endAtPositionPaths[i]), originEntity, destination);
      }
    }
  }

  // pass in a coordinate of a base or factory block, fetch all surrounding conveyer nodes.
  function claimAdjacentConveyerTiles(Coord memory coord, uint256 originEntity, uint256 destination) public {
    claimConveyerTile(Coord(coord.x - 1, coord.y), originEntity, destination);
    claimConveyerTile(Coord(coord.x + 1, coord.y), originEntity, destination);
    claimConveyerTile(Coord(coord.x, coord.y + 1), originEntity, destination);
    claimConveyerTile(Coord(coord.x, coord.y - 1), originEntity, destination);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    // Components
    ClaimComponents memory c = ClaimComponents(
      PositionComponent(getAddressById(components, PositionComponentID)),
      TileComponent(getAddressById(components, TileComponentID)),
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      HealthComponent(getAddressById(components, HealthComponentID))
    );

    Coord memory coord = abi.decode(arguments, (Coord));

    // check if main base
    uint256[] memory entitiesAtPosition = c.positionComponent.getEntitiesWithValue(coord);
    require(entitiesAtPosition.length == 1, "can not claim base at empty coord");

    // Check that the coordinates is owned by the msg.sender
    uint256 ownedEntityAtStartCoord = c.ownedByComponent.getValue(entitiesAtPosition[0]);
    require(ownedEntityAtStartCoord == addressToEntity(msg.sender), "can not claim resource at not owned tile");

    // Check that health is not zero
    require(LibHealth.checkAlive(c.healthComponent, entitiesAtPosition[0]), "health is not zero");

    uint256 endClaimTime = block.number;
    c.lastClaimedAtComponent.set(entitiesAtPosition[0], endClaimTime);

    // destination is either a wallet (store item in wallet-specific global inventory)
    // or entity ID (store item in entity, eg within a factory)

    // Check main base, if so destination is the wallet
    if (c.tileComponent.getValue(entitiesAtPosition[0]) == MainBaseID) {
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], addressToEntity(msg.sender));
    }
    // store items in the Silo for emitting bullets
    else if (c.tileComponent.getValue(entitiesAtPosition[0]) == SiloID) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], destination);
    }
    // claim for all other factories
    else if (LibClaim.isClaimableFactory(c.tileComponent.getValue(entitiesAtPosition[0]))) {
      uint256 destination = entitiesAtPosition[0];
      claimAdjacentConveyerTiles(coord, entitiesAtPosition[0], destination);
    } else {
      revert("can not claim resource or crafted component at tile");
    }

    return abi.encode(0);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    // Pass in the coordinates of the main base
    return execute(abi.encode(coord));
  }
}
