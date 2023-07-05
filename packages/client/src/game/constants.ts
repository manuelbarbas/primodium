import { BlockType } from "../util/constants";

export enum Scenes {
  Main = "Main",
}

export const TILE_HEIGHT = 16;
export const TILE_WIDTH = 16;
export const RENDER_INTERVAL = 35;
export const ANIMATION_INTERVAL = 200;

export enum Assets {
  Pack = "/assets/pack",
  SpriteAtlas = "sprite-atlas",
  ResourceTileset = "resource-tileset",
  TerrainTileset = "terrain-tileset",
}

export enum Tilesets {
  Terrain = "Terrain",
  Resource = "Resource",
}

export enum DepthLayers {
  Terrain = 0,
  Building = 10,
  Path = 20,
  Tooltip = 30,
  Marker = 40,
}

export enum TerrainTilekeys {
  Air,
  Alluvium,
  Bedrock,
  Biofilm,
  Regolith,
  Sandstone,
  Water,
}

export enum ResourceTilekeys {
  Bolutite,
  Copper,
  Iridium,
  Iron,
  Kimberlite,
  Lithium,
  Osmium,
  Titanium,
  Tungsten,
  Uraninite,
}

export const Tilekeys = { ...TerrainTilekeys, ...ResourceTilekeys };

export enum TileAnimationKeys {
  Water = "Water",
}

export enum KeyindActions {
  Up,
  Down,
  Left,
  Right,
  Center,
  Base,
  Hotbar1,
  Hotbar2,
  Hotbar3,
  Hotbar4,
  Hotbar5,
  Hotbar6,
  Hotbar7,
  Hotbar8,
  Hotbar9,
  Hotbar0,
  Marker1,
  Marker2,
  Marker3,
  Marker4,
  ZoomIn,
  ZoomOut,
  RightClick,
  LeftClick,
  BuildMenu,
  AttackMenu,
  InventoryMenu,
  Mute,
  MainMenu,
  Debug,
  DeleteBuilding,
  DeletePath,
}

export enum SpriteKeys {
  Mainbase = "mainbase/mainbase-0.png",
  Node = "node/node-0.png",
  BasicMiner = "minerdrill/minerdrill-0.png",
  Miner = "miner/miner.png",
  BasicBatteryFactory = "basicbatteryfactory/basicbatteryfactory-0.png",
  AdvancedBatteryFactory = "advancedbatteryfactory/advancedbatteryfactory-0.png",
  BulletFactory = "bulletfactory/bulletfactory.png",
  DenseMetalRefinery = "densemetalrefinery/densemetalrefinery-0.png",
  HardenedDrill = "hardeneddrill/hardeneddrill-0.png",
  HighTempFoundry = "hightempfoundry/hightempfoundry-0.png",
  IridiumDrillBitFactory = "iridiumdrillbitfactory/iridiumdrillbitfactory-0.png",
  KimberliteCatalyst = "kimberlitecatalyst/kimberlitecatalyst-0.png",
  KineticMissileFactory = "kineticmissilefactory/kineticmissilefactory.png",
  LaserFactory = "laserfactory/laserfactory-0.png",
  MissileLaunchComplex = "missilelaunchcomplex/missilelaunchcomplex-0.png",
  PlatingFactory = "platingfactory/platingfactory-0.png",
  PrecisionMachineryFactory = "precisionmachineryfactory/precisionmachineryfactory-0.png",
  PrecisionPneumaticDrill = "precisionpneumaticdrill/precisionpneumaticdrill-0.png",
  ProjectileLauncher = "projectilelauncher/projectilelauncher.png",
  Silo = "silo/silo.png",
  ThermobaricMissileFactory = "thermobaricmissilefactory/thermobaricmissilefactory.png",
  ThermobaricWarheadFactory = "thermobaricwarheadfactory/thermobaricwarheadfactory.png",
}

export enum AnimationKeys {
  Mainbase = "mainbase",
  Node = "node",
  AdvancedBatteryFactory = "advancedbatteryfactory",
  BasicBatteryFactory = "basicbatteryfactory",
  BasicMiner = "minerdrill",
  DenseMetalRefinery = "densemetalrefinery",
  HardenedDrill = "hardeneddrill",
  Hightempfoundry = "hightempfoundry",
  IridiumDrillbitFactory = "iridiumdrillbitfactory",
  KimberliteCatalyst = "kimberlitecatalyst",
  LaserFactory = "laserfactory",
  MissileLaunchComplex = "missilelaunchcomplex",
  PlatingFactory = "platingfactory",
  PrecisionMachineryFactory = "precisionmachineryfactory",
  PrecisionPneumaticDrill = "precisionpneumaticdrill",
}

export const EntityIdtoTilesetId = {
  [BlockType.Air]: Tilekeys.Air,
  [BlockType.Iron]: Tilekeys.Iron,
  [BlockType.Biofilm]: Tilekeys.Biofilm,
  [BlockType.Sandstone]: Tilekeys.Sandstone,
  [BlockType.Water]: Tilekeys.Water,
  [BlockType.Bedrock]: Tilekeys.Bedrock,
  [BlockType.Regolith]: Tilekeys.Regolith,
  [BlockType.Copper]: Tilekeys.Copper,
  [BlockType.Lithium]: Tilekeys.Lithium,
  [BlockType.Titanium]: Tilekeys.Titanium,
  [BlockType.Osmium]: Tilekeys.Osmium,
  [BlockType.Tungsten]: Tilekeys.Tungsten,
  [BlockType.Iridium]: Tilekeys.Iridium,
  [BlockType.Kimberlite]: Tilekeys.Kimberlite,
  [BlockType.Uraninite]: Tilekeys.Uraninite,
  [BlockType.Bolutite]: Tilekeys.Bolutite,
};

export const EntityIDtoSpriteKey = {
  [BlockType.MainBase]: SpriteKeys.Mainbase,
  [BlockType.Node]: SpriteKeys.Node,
  [BlockType.BasicMiner]: SpriteKeys.BasicMiner,
  [BlockType.Miner]: SpriteKeys.Miner,
  [BlockType.BasicBatteryFactory]: SpriteKeys.BasicBatteryFactory,
  [BlockType.AdvancedBatteryFactory]: SpriteKeys.AdvancedBatteryFactory,
  [BlockType.BulletFactory]: SpriteKeys.BulletFactory,
  [BlockType.DenseMetalRefinery]: SpriteKeys.DenseMetalRefinery,
  [BlockType.HardenedDrill]: SpriteKeys.HardenedDrill,
  [BlockType.HighTempFoundry]: SpriteKeys.HighTempFoundry,
  [BlockType.IridiumDrillbitFactory]: SpriteKeys.IridiumDrillBitFactory,
  [BlockType.KimberliteCatalystFactory]: SpriteKeys.KimberliteCatalyst,
  [BlockType.KineticMissileFactory]: SpriteKeys.KineticMissileFactory,
  [BlockType.HighEnergyLaserFactory]: SpriteKeys.LaserFactory,
  [BlockType.MissileLaunchComplex]: SpriteKeys.MissileLaunchComplex,
  [BlockType.PlatingFactory]: SpriteKeys.PlatingFactory,
  [BlockType.PrecisionMachineryFactory]: SpriteKeys.PrecisionMachineryFactory,
  [BlockType.PrecisionPneumaticDrill]: SpriteKeys.PrecisionPneumaticDrill,
  [BlockType.ProjectileLauncher]: SpriteKeys.ProjectileLauncher,
  [BlockType.Silo]: SpriteKeys.Silo,
  [BlockType.ThermobaricMissileFactory]: SpriteKeys.ThermobaricMissileFactory,
  [BlockType.ThermobaricWarheadFactory]: SpriteKeys.ThermobaricWarheadFactory,
};

export const EntityIDtoAnimationKey = {
  [BlockType.MainBase]: AnimationKeys.Mainbase,
  [BlockType.Node]: AnimationKeys.Node,
  [BlockType.BasicMiner]: AnimationKeys.BasicMiner,
  [BlockType.Miner]: AnimationKeys.BasicMiner,
  [BlockType.BasicBatteryFactory]: AnimationKeys.BasicBatteryFactory,
  [BlockType.AdvancedBatteryFactory]: AnimationKeys.AdvancedBatteryFactory,
  [BlockType.BulletFactory]: AnimationKeys.BasicBatteryFactory,
  [BlockType.DenseMetalRefinery]: AnimationKeys.DenseMetalRefinery,
  [BlockType.HardenedDrill]: AnimationKeys.HardenedDrill,
  [BlockType.HighTempFoundry]: AnimationKeys.Hightempfoundry,
  [BlockType.IridiumDrillbitFactory]: AnimationKeys.IridiumDrillbitFactory,
  [BlockType.KimberliteCatalystFactory]: AnimationKeys.KimberliteCatalyst,
  [BlockType.HighEnergyLaserFactory]: AnimationKeys.LaserFactory,
  [BlockType.MissileLaunchComplex]: AnimationKeys.MissileLaunchComplex,
  [BlockType.PlatingFactory]: AnimationKeys.PlatingFactory,
  [BlockType.PrecisionMachineryFactory]:
    AnimationKeys.PrecisionMachineryFactory,
  [BlockType.PrecisionPneumaticDrill]: AnimationKeys.PrecisionPneumaticDrill,
};
