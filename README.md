# Primodium MUD

Initialize with `yarn`. Afterwards, in separate terminal sessions, run the following commands in order:

```
yarn workspace contracts run devnode
yarn workspace contracts run dev
yarn workspace client run dev
```

The test page is located at `localhost:3000/increment?dev=true&worldAddress=<address>`.

# Design

To craft from factory

- ClaimSystem: Claiming Resources from Mine.
  - Called from factories (mines -> factories), main base (mines -> main base)
- ClaimFactory: Claiming finished crafted items from factory.
  - Called from factories (factories -> factories), main base (factories -> main base)
- CraftSystem: Crafting Items (called from factories)
  - Called from factories (items already in factories, no resource flows)

# Components

A new int256 component is created for each resource and crafted item. A new boolean component is created for each research objective.

```
## Core Compnents

CounterComponent
GameConfigComponent
PositionComponent
TileComponent
OwnedByComponent
PathComponent
LastBuiltAtComponent
LastClaimedAtComponent
HealthComponent

## Resource Compnents

BolutiteResourceComponent
CopperResourceComponent
IridiumResourceComponent
IronResourceComponent
KimberliteResourceComponent
LithiumResourceComponent
OsmiumResourceComponent
TitaniumResourceComponent
TungstenResourceComponent
UraniniteResourceComponent

### Crafted Components (Debug) uint256

BulletCraftedComponent

### Crafted Components (Gameplay) uint256

IronPlateCraftedComponent
BasicPowerSourceCraftedComponent
KineticMissileCraftedComponent
RefinedOsmiumCraftedComponent
AdvancedPowerSourceCraftedComponent
PenetratingWarheadCraftedComponent
PenetratingMissileCraftedComponent
TungstenRodsCraftedComponent
IridiumCrystalCraftedComponent
IridiumDrillbitCraftedComponent
LaserPowerSourceCraftedComponent
ThermobaricWarheadCraftedComponent
ThermobaricMissileCraftedComponent
KimberliteCrystalCatalystCraftedComponent

### Research Components (Debug) bool

FastMinerResearchComponent

### Research Components (Gameplay) bool

_Unlocked (doesn't exist)_
MainBaseResearchComponent
IronResearchComponent
BasicMinerResearchComponent
ConveyorResearchComponent
NodeResearchComponent

_Locked Resources (contracts)_
CopperResearchComponent
LithiumResearchComponent
TitaniumResearchComponent
OsmiumResearchComponent
TungstenResearchComponent
IridiumResearchComponent
KimberliteResearchComponent

_Locked Buildings (contracts)_
PlatingFactoryResearchComponent
BasicBatteryFactoryResearchComponent
KineticMissileFactoryResearchComponent
ProjectileLauncherResearchComponent
HardenedDrillResearchComponent
DenseMetalRefineryResearchComponent
AdvancedBatteryFactoryResearchComponent
HighTempFoundryResearchComponent
PrecisionMachineryFactoryResearchComponent
IridiumDrillbitFactoryResearchComponent
PrecisionPneumaticDrillResearchComponent
PenetratorFactoryResearchComponent
PenetratingMissileFactoryResearchComponent
MissileLaunchComplexResearchComponent
HighEnergyLaserFactoryResearchComponent
ThermobaricWarheadFactoryResearchComponent
ThermobaricMissileFactoryResearchComponent
KimberliteCatalystFactoryResearchComponent

### Buildings (Debug)

MainBase
Conveyor
Miner
LithiumMiner
BulletFactory
Silo

### Buildings (Gameplay)
// NOTE: Node is like Conveyor, but costs money and not for debug.

BasicMiner
Node
PlatingFactory
BasicBatteryFactory
KineticMissileFactory
ProjectileLauncher
HardenedDrill
DenseMetalRefinery
AdvancedBatteryFactory
HighTempFoundry
PrecisionMachineryFactory
IridiumDrillbitFactory
PrecisionPneumaticDrill
PenetratorFactory
PenetratingMissileFactory
MissileLaunchComplex
HighEnergyLaserFactory
ThermobaricWarheadFactory
ThermobaricMissileFactory
KimberliteCatalystFactory

## Main base
MainBaseInitializedComponent
```
