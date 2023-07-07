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

# Debug

To utilize any of the debug utilities `LibDebug.IsDebug` must return `true`
For testing purposes in the context of writing tests and play testing with client two core methods are available:

- DebugSystems: these systems can modify game design data and game state based on the testers needs. currently these systems are developed:

  - `DebugAcquireResourcesBasedOnRequirementSystem`
  - `DebugAcquireResourcesSystem`
  - `DebugAcquireStorageForAllResourcesSystem`
  - `DebugIgnoreBuildLimitForBuildingSystem`
  - `DebugRemoveBuildingRequirementsSystem`
  - `DebugRemoveBuildLimitSystem`
  - `DebugRemoveUpgradeRequirementsSystem`

- LibDebugInitializer: configure different buildings and technologies in this initializer library based on your requirements. currently most tests are written using this method

# Claiming/Crafting Design

Claiming from a MainBase stores items in the user's inventory, where the user's address is hashed for `ItemComponent`. Claiming from factories stores items in the factory, where the address representation of the building's entity ID is hashed for `ItemComponent`.

To craft from factory (TODO)

# Upgrading

`MaxLevelComponent` for a building id indicates that that building can be upgraded and up to what level
`BuildingComponent` for a building entity indicates that the entity is a building and what level it is

# Storage

In the `LibStorageDesignInitializer` Buildings which increase storage capacity are designated the Resources they provide capacity for via `StorageCapacityResourcesComponent` for the levels in which they provide that capacity increase. The amount of capacity they provide is set for their designated levels via `StorageCapacityComponent`

`buildingLevelId = hashKeyEntity(buildingId, level)`
`resourceBuildingLevelId = hashKeyEntity(resourceId, buildingLevelId)`

the amount of Iron storage that is provided by a level 2 MainBase is :
`storageCapacityComponent.getValue(hashKeyEntity(Iron,hashKeyEntity(MainBaseID, 2)))`

When Buildings are Built, Upgraded or Destroyed `StorageCapacityComponent` is updated for the player and the resources they modify the capacity for.
`playerResourceID = hashKeyEntity(resourceId, playerEntity)`

# Resource Production

`MineComponent`:

- for the combination of player entity and resource id stores the production of that resource per block
- for the combination of building id, level and resource stores the production rate of that resource for that level of that building

resource production is updated when:

- a path is built or destroyed from a building with resource production to MainBase
- a building that has a path to main base is upgraded

before production is changed `UnclaimedResourceComponent` is updated for the player entity and resource id.
this component tracks how much resource is produced but not claimed. `UnclaimedResourceComponent` is always calculated based on the production rate of that resource at that point and will always be less than or equal to the available space for that resource in the players storage

# Factories

Factories are similar to Mines but to produce resources they require other Mines to be connected to them.
for a factory to be functional the level of the Mines connected should not be lower then the level of the factory itself.

`FactoryMineBuildingsComponent` : for a combination key of `BuildingID` and Level contains two arrays:

- `MineBuildingId` : a list of mine building ids that has to be connected to the factory for it to be functional
- `MineBuildingCount`: a list of how many of each mine building that has to be connected to the factory

`FactoryProductionComponent` : for a combination key of `BuildingID` and Level contains two ids:

- `ResourceID` : the resource type this factory produces
- `ResourceProductionRate` : the production of this factory per block (note for future we should modify the way this value is interpreted so it isn't per block to be able to reduce the tempo. maybe the rate can be per 100 blocks for example)

`FactoryIsFunctionalComponent`: for an existing factory entity declares if that factory is functional. this value is updated when a player action either results in the factory becoming functional or results in it becoming non functional

`LibFactoryDesignInitializer`: writes the design data for factories for each of their levels on `FactoryMineBuildingsComponent` and `FactoryProductionComponent`

`LibFactory` : contains the core logic functions for two main purposes:

- updating the `FactoryIsFunctionalComponent` for a factory entity when a player action may result in the factory to become functional or non functional

# Component Structure

`OwnedByComponent` records building ownership while `ItemComponent` records mined and crafted item ownership.

## Core Compnents

`CounterComponent` is a debug component for testing purposes. `GameConfigComponent` is currently unused. It should be used in the future for randomizing the Perlin noise seed and initializing other game state.

```
  CounterComponent
  GameConfigComponent
  TileComponent
  OwnedByComponent
  PathComponent
  LastBuiltAtComponent
  LastClaimedAtComponent
  LastResearchedAtComponent
  HealthComponent
```

## Resource and Research

The keys of the following component is a hash of the uint256 representation of an item or research objective and an entity address, as defined in `hashKeyEntity()` in `packages/contracts/src/libraries/LibEncode.sol`. Entity addresses are either user wallets or entities generated by `BuildSystem` - such entity IDs are truncated from uint256 to uint160 upon creation to standardize hashing outputs.

```
  ItemComponent
  ResearchComponent
```

## Game metadata

The following components are used to store metadata that is read before a building is built by the user. `RequiredResourcesComponent` stores a list of resource IDs that are required by a building, after which the specific resource count is stored in `ItemComponent` as "owned" by the building ID (i.e. `hashKeyEntity(resourceId, buildingId)` as key with count as value). `RequiredResearchComponent` is a boolean that stores the required research objective. `BuildingLimitComponent` stores building limit requirements.

`TileComponent`: set for a building ID to only allow that building to be built on the set tile type

```
  RequiredResearchComponent
  RequiredResourcesComponent
  ItemComponent
  BuildingLimitComponent
```

## Game mechanics

`MainBaseInitializedComponent` stores the coordinates of the user's base, where the map is panned to by default. New users are provided 200 free iron in the tutorial, the status of which is recorded by the boolean `StarterPackInitializedComponent`.

```
  MainBaseInitializedComponent
  StarterPackInitializedComponent
```

# Item listing

All the items in the game is listed at https://tiles.primodium.com/.
