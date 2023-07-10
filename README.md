# Primodium MUD

Initialize with `yarn`. Afterwards, in separate terminal sessions, run the following commands in order:

```
yarn workspace contracts run devnode
yarn workspace contracts run dev
yarn workspace client run dev
```

The test page is located at `localhost:3000/increment?dev=true&worldAddress=<address>`.

# Testing and Deployment

For testing, set the `isDebug()` function to return true in `packages/contracts/src/libraries/LibDebug.sol`. Then, create an empty environment file at `packages/client/.env` and set the following:

```
VITE_DEV=true
```

Deploy the contracts on the local environment using the commands in the previous section. This enables debug buildings to be built, which are free. Additional unit tests is provided by the mud cli and can be accessed below from the `packages/contracts` directory.

```
mud test
```

For production deployment, Primodium is currently live on the 0xPARC/Lattice testnet. Set the `isDebug()` function to return false, then deploy the contracts with the following command in the `packages/contracts` directory.

```
npx mud deploy --chainSpec chainSpecSkyStrife.json --deployerPrivateKey <testnet key>
```

The client is automatically deployed on Vercel from the main branch. The live instance is located at `testnet2.primodium.com/?worldAddress=<world address>` with the rpc settings to the 0xPARC/Lattice testnet.

# Debug Systems

To utilize any of the debug utilities `LibDebug.IsDebug` must return `true`. For testing purposes in the context of writing tests and play testing with client two core methods are available:

- `LibDebugInitializer`: First, configure debug buildings and technologies in this initializer library.

- `DebugSystems`: Then, use the following systems to modify debug data.

  - `DebugAcquireResourcesBasedOnRequirementSystem`
  - `DebugAcquireResourcesSystem`
  - `DebugAcquireStorageForAllResourcesSystem`
  - `DebugIgnoreBuildLimitForBuildingSystem`
  - `DebugRemoveBuildingRequirementsSystem`
  - `DebugRemoveBuildLimitSystem`
  - `DebugRemoveUpgradeRequirementsSystem`

# Resource and Research Requirements

The following components are used to store _metadata_ that is read before a building is built by the user. `RequiredResourcesComponent` stores a list of resource IDs that are required by a building, after which the specific resource count is stored in `ItemComponent` as "owned" by the building ID (i.e. `hashKeyEntity(resourceId, buildingId)` as key with count as value). `RequiredResearchComponent` is a boolean that stores the required research objective. `BuildingLimitComponent` stores building limit requirements.

```
  RequiredResearchComponent
  RequiredResourcesComponent
  ItemComponent
  BuildingLimitComponent
```

# Resource Production

`MineComponent` stores both metadata and player data.

- _Metadata_: with `hashKeyEntity(buildingId, buildingLevel)` as key, stores the production rate of that resource for that level of that building per blockchain block. In `LibBuildingDesignInitializer`, the production rate is set for each level of each building that produces resources.
- _Player Data_: with `hashKeyEntity(resourceId, playerEntity)` as key, stores the production of that resource per blockchain block.

Player resource production is updated when:

- a path is built or destroyed from a building with resource production to MainBase
- a building that has a path to MainBase is upgraded

`UnclaimedResourceComponent` tracks how much resource is produced but not claimed. It is updated for the player entity and resource ID before production is changed.

`UnclaimedResourceComponent` is always calculated based on the production rate of that resource at that point. The unclaimed resource count will always be less than or equal to the available space for that resource in the players storage, which is stored in `StorageCapacityComponent`.

# Factories

Factory production is similar to how mining resource production is calculated. However, to produce resources factories require other mines to be connected to them. For a factory to be functional, the level of the mine connected should not be lower then the level of the factory itself.

`FactoryMineBuildingsComponent`: with `hashKeyEntity(buildingId, buildingLevel)` as key, contains two arrays:

- `MineBuildingId` : a list of mine building ids that has to be connected to the factory for it to be functional
- `MineBuildingCount`: a list of how many of each mine building that has to be connected to the factory

`FactoryProductionComponent`: with `hashKeyEntity(buildingId, buildingLevel)` as key, contains two IDs:

- `ResourceID` : the resource type this factory produces
- `ResourceProductionRate` : the production of this factory per block (note for future we should modify the way this value is interpreted so it isn't per block to be able to reduce the tempo. maybe the rate can be per 100 blocks for example)

`FactoryIsFunctionalComponent`: for an existing factory entity, declares if that factory is functional. This value is updated when a player action either results in the factory becoming functional or results in it becoming non-functional.

`LibFactoryDesignInitializer` writes the design data for factories for each of their levels on `FactoryMineBuildingsComponent` and `FactoryProductionComponent`.

`LibFactory` contains the core logic functions for two main purposes:

- updating the `FactoryIsFunctionalComponent` for a factory entity when a player action may result in the factory to become functional or non functional

# Building Upgrades

Each building can be upgraded to unlock more capabilities. Specifications are located [here](https://www.notion.so/palifer/abe7f4855bb441198acd4bae918b4619?v=54c17e8787e24596bc3d4f94f81761bd&p=96af4ae778304d11b40b773a94a826df&pm=s).

- `MaxLevelComponent` with a building ID (e.g. DebugIronMineID) as key, indicates that that a building can be upgraded and up to what level.
- `BuildingComponent` with a building entity ID as key (e.g. TODO), stores the current level of the building.

When a building is upgraded, `PostUpgradeSystem` is called to update the building's components and the player's resource production.

# Building Storage

In `LibStorageDesignInitializer`, buildings which increase storage capacity are designated the Resources they provide capacity for via `StorageCapacityResourcesComponent` for the levels in which they provide that capacity increase. The amount of capacity they provide is set for their designated levels via `StorageCapacityComponent`.

```
  buildingLevelId = hashKeyEntity(buildingId, buildingLevel)
  resourceBuildingLevelId = hashKeyEntity(resourceId, buildingLevelId)
```

For example, the amount of Iron storage that is provided by a level 2 MainBase is:
`storageCapacityComponent.getValue(hashKeyEntity(Iron,hashKeyEntity(MainBaseID, 2)))`

When buildings are built with, upgraded, or destroyed, `StorageCapacityComponent` is updated for the player and the resources they modify the capacity for.

# Player Storage

`OwnedByComponent` records building ownership while `ItemComponent` records mined and crafted item ownership, with `hashKeyEntity(resourceId, playerEntity)` as key.

```
  ItemComponent
  ResearchComponent
```

# Building Positions

`TileComponent` stores a packed representation of `int32` by `int32` coordinates as the key with `buildingId` as value. Keys are generated with `encodeCoordEntity(Coord memory coord, string memory key)`. The string passed into `encodeCoordEntity` is padding that ensures that there are no collisions. Implemented in #25.

## Core Components

`CounterComponent` is a debug component for testing purposes. `GameConfigComponent` is currently unused. It should be used in the future for randomizing the Perlin noise seed and initializing other game state.

```
  CounterComponent
  GameConfigComponent (unused)
  TileComponent
  OwnedByComponent
  PathComponent
  LastBuiltAtComponent
  LastClaimedAtComponent
  LastResearchedAtComponent
  HealthComponent
```

# TODO: which systems call systems?

# Game Mechanic Components

`MainBaseInitializedComponent` stores the coordinates of the user's base, where the map is panned to by default. New users are provided 200 free iron in the tutorial, the status of which is recorded by the boolean `StarterPackInitializedComponent`.

```
  MainBaseInitializedComponent
  StarterPackInitializedComponent
```

# Item listing

All the items in the game is listed at https://tiles.primodium.com/.
