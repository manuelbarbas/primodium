# Primodium v0.7.1

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
PRI_DEV=true
```

Deploy the contracts on the local environment using the commands in the previous section. This enables debug buildings to be built, which are free. Additional unit tests is provided by the mud cli and can be accessed below from the `packages/contracts` directory.

```
mud test
```

For production deployment, Primodium is currently live on the Caldera testnet. To deploy, follow these steps:

1. Switch to the contracts directory with `cd packages/contracts`
2. Generate `deploy-live.json` with `yarn gen:json`
3. Deploy with forge:

```
mud deploy-contracts --rpc https://primodium-bedrock.calderachain.xyz/replica-http --deployerPrivateKey <testnet key> --config ./deploy-live.json
```

The client is automatically deployed on Vercel from the main branch. The live instance is located at `testnet2.primodium.com/?worldAddress=<world address>` with the rpc settings to the Caldera testnet.

# Debug Systems

To utilize any of the debug utilities `LibDebug.IsDebug` must return `true`. For testing purposes in the context of writing tests and play testing with client two core methods are available:

- `LibDebugInitializer`: First, configure debug buildings and technologies in this initializer library.

- `ComponentDevSystem`: Then, `ComponentDevSystem` systems to modify debug data. For example, `ComponentDevSystem` can be used to set the level of a building or the amount of a resource. See below and the tests in `packages/contracts/src/test/systems` for further examples.

- To set component data for an entity:

```
componentDevSystem.executeTyped(
ItemComponentID,
LibEncode.hashKeyEntity(requiredResources.resources[i], addressToEntity(alice)),
abi.encode(requiredResources.values[i])
);
```

- To remove component data for an entity:

```
componentDevSystem.executeTyped(
P_RequiredResourcesComponentID,
LibEncode.hashKeyEntity(DebugIronPlateFactoryID, 1),
abi.encode()
);
```

# Blueprints

Each building has a blueprint which determines its size and shape when an instance of that building is created. In order to add a building to the world, you must initialize its blueprint as an array of coordinates (relative to the origin) in the `LibBlueprintInitializer` library.

When a building is created, its tiles are determined based on the prototype's blueprint. A building cannot be placed if its tile overlaps another building's tile.

# Resource and Research Requirements

`P_RequiredResourcesComponent`: stores a list of resource IDs and values that are required for:

- Building and Upgrading Buildings: `hashKeyEntity(buildingId, buildingLevel)`
- Research: `researchID`
  `P_RequiredResearchComponent`: stores the required `researchID` for:
- Building and Upgrading Buildings: `hashKeyEntity(buildingId, buildingLevel)`
- Research: `researchID`

# Resource Production

`P_ProductionComponent` stores the resource production and value for a building level (`hashKeyEntity(buildingId, level)`)
`ProductionComponent` stores the resource production for `hashKeyEntity(resourceId, entity)` in which the entity can be `playerEntity` or `buildingEntity`

`ProductionComponent` for `hashKeyEntity(resourceId, playerEntity)` and `hashKeyEntity(resourceId, buildingEntity)` are both updated by `S_UpdateResourceProduction`.

`S_UpdateResourceProduction` is called by `S_UpdateActiveStatusSystem` when `ActiveComponent` value is updated for a building with `P_ProductionComponent`. this update can take place by the following changes

- a path is built or destroyed from a building with resource production to MainBase or a building with `P_ProductionDependenciesComponent`
- a building that has a path to MainBase or a building with `P_ProductionDependenciesComponent` is upgraded

`P_ProductionDependenciesComponent` stores the resource IDs and value of required connected buildings with `P_ProductionComponent` for a building level (`hashKeyEntity(buildingId, level)`)

example: `IronPlateFactory` level 1 requires 1 building with production of `Iron` to be connected to it so that it can produce `IronPlate`

`IronPlateFactory`:

- `P_ProductionDependenciesComponent`(`Iron`,1)
- `P_ProductionComponent`(`IronPlate`,1)

`IronMine`

- `P_ProductionComponent`(`Iron`,1)

`ActiveComponent` : tracks if a building with both `P_ProductionComponent` and `P_ProductionDependenciesComponent` is active
for a building to be active the following conditions must be met:

- for each `ResourceID` and `Value` in `P_ProductionDependenciesComponent`, `Value` amount of buildings with `P_ProductionComponent` of `ResourceID` must be connected to it
- all the connected buildings must be at least of the same level as it
- if any of the connected buildings have `P_ProductionDependenciesComponent` for their current level they must have a `ActiveComponent` value of `true`

# Building Upgrades

Each building can be upgraded to unlock more capabilities. Specifications are located [here](https://www.notion.so/palifer/abe7f4855bb441198acd4bae918b4619?v=54c17e8787e24596bc3d4f94f81761bd&p=96af4ae778304d11b40b773a94a826df&pm=s).

- `P_MaxLevelComponent` with a building ID (e.g. DebugIronMineID) as key, indicates that that a building can be upgraded and up to what level.
- `LevelComponent` with a building entity ID as key (e.g. TODO), stores the current level of the building.

When a building is upgraded, `PostUpgradeBuildingSystem` is called to update the building's components and the player's resource production.

# Building Storage

`P_MaxResourceStorageComponent`: stores the ResourceIds for a building level (`hashKeyEntity(buildingId, level)`) which the building provides storage capacity increase for.
`P_MaxStorageComponent`: stores the amount of storage capacity increase for `hashKeyEntity(resourceID,hashKeyEntity(buildingId, level)` which the building level provides storage capacity for.

```

levelId = hashKeyEntity(buildingId, level)
resourceLevelId = hashKeyEntity(resourceId, levelId)

```

For example, the amount of Iron storage that is provided by a level 2 MainBase is:
`maxStorageComponent.getValue(hashKeyEntity(Iron,hashKeyEntity(MainBaseID, 2)))`

# Player Storage

`P_MaxResourceStorageComponent`: stores the Resource Ids the player has storage for using `playerEntity`
`P_MaxStorageComponent` : stores the amount of storage of each resource the player has using `hashKeyEntity(resourceId, playerEntity)`
When buildings are built with, upgraded, or destroyed, `P_MaxStorageComponent` is updated for the player and the resources they modify the capacity for.

`OwnedByComponent` records building ownership

`ItemComponent` records mined and crafted item ownership, with `hashKeyEntity(resourceId, playerEntity)` as key.

```

ItemComponent
HasResearchedComponent

```

`Utility Resources`

- Utility resources are resources which are not produced but act as capacity to allow buildings which require them to be built. Example:
- Solar Panel increases Electricity Capacity by 4 value
- Alloy Factory requires and occupies 2 Electricity

`P_RequiredUtilityComponent`: for `LibHash(BuildingType, Level)` indicates what Utility resources it requires and how much.
`P_UtilityProductionComponent`: for `LibHash(BuildingType, Level)` indicates what Utility resource and how much of it the building produces.

`MaxUtilityComponent`: stores the total amount of `Utility Capacity` the player has for `LibHash(ResourceID, PlayerEntity)`
`OccupiedUtilityResourceComponent`: stores the total amount of `Utility Capacity` that the player has already used up for `LibHash(ResourceID, PlayerEntity)`

- Utility resource checks and updates are only processed in the `BuildSystem` and `DestroySystem` meaning upgrades and paths have no effect on them.
- The player not build a building that requires Utility resources if they the total occuppied capacity for that resource will excceed the current capacity after build is complete.
- The Player can not destroy a `BuildingType` that has `P_UtilityProductionComponent` if the total capacity of that resource will be less than the total occuped capacity of that resource.

# Building Positions

`BuildingTypeComponent` stores a packed representation of `int32` by `int32` coordinates as the key with `buildingId` as value. Keys are generated with `encodeCoordEntity(Coord memory coord, string memory key)`. The string passed into `encodeCoordEntity` is padding that ensures that there are no collisions. Implemented in #25.

## Core Components

`CounterComponent` is a debug component for testing purposes. `GameConfigComponent` is currently unused. It should be used in the future for randomizing the Perlin noise seed and initializing other game state.

```

CounterComponent
GameConfigComponent (unused)
BuildingTypeComponent
OwnedByComponent
PathComponent
LastClaimedAtComponent

```

# TODO: which systems call systems?

# Game Mechanic Components

`MainBaseComponent` stores the coordinates of the user's base, where the map is panned to by default.

```

MainBaseComponent

```

# Item listing

All the items in the game is listed at https://tiles.primodium.com/.

```

```
