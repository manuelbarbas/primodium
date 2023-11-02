import { EResource } from "contracts/config/enums";
import { find } from "lodash";
import AsteroidTiledMap from "../maps/asteroid_0.7.json";
import { EntityType } from "../util/constants";
export const ASSET_PACK = "/assets/pack.json";

export const TILE_HEIGHT = 16;
export const TILE_WIDTH = 16;
export const RENDER_INTERVAL = 30;
export const ANIMATION_INTERVAL = 200;
export const KEY = "MAIN";

export enum Scenes {
  Root = "ROOT",
  Asteroid = "MAIN",
  Starmap = "STARMAP",
}

export enum Assets {
  SpriteAtlas = "sprite-atlas",
  ResourceTileset = "resource",
}

export enum Tilesets {
  Terrain = "Terrain",
  Resource = "Resource",
  Fog = "Fog",
}

export enum DepthLayers {
  Terrain = 0,
  Building = 4000,
  Path = 5000,
  Marker = 6000,
  Tooltip = 700,
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
  Iron,
  Copper,
  Lithium,
  Sulfur,
}

const FogTilekeysGID =
  find(AsteroidTiledMap.tilesets, {
    name: "fog",
  })?.firstgid ?? 0;

export enum FogTilekeys {
  Empty = FogTilekeysGID,
  BottomRight = FogTilekeysGID + 10,
  OuterBottomRight = FogTilekeysGID + 15,
  TopLeft = FogTilekeysGID + 2,
  OuterTopLeft = FogTilekeysGID + 17,
  TopRight = FogTilekeysGID + 3,
  OuterTopRight = FogTilekeysGID + 1,
  Top = FogTilekeysGID + 14,
  OuterTop = FogTilekeysGID + 16,
  Left = FogTilekeysGID + 8,
  OuterLeft = FogTilekeysGID + 6,
  Right = FogTilekeysGID + 6,
  OuterRight = FogTilekeysGID + 8,
  BottomLeft = FogTilekeysGID + 9,
  OuterBottomLeft = FogTilekeysGID + 13,
  Bottom = FogTilekeysGID + 16,
  OuterBottom = FogTilekeysGID + 14,
  Base = FogTilekeysGID + 7,
}

export const TileKeys = { ...TerrainTilekeys, ...ResourceTilekeys };

export enum TileAnimationKeys {
  Water = "Water",
}

export enum SpriteKeys {
  //BUILDINGS
  Mainbase1 = "sprites/mainbase/level1/Main_Base_LVL1_1.png",
  Mainbase2 = "sprites/mainbase/level2/Main_Base_LVL2_1.png",
  Mainbase3 = "sprites/mainbase/level3/Main_Base_LVL3_1.png",
  Mainbase4 = "sprites/mainbase/level4/Main_Base_LVL4_1.png",
  Mainbase5 = "sprites/mainbase/level5/Main_Base_LVL5_1.png",
  Mainbase6 = "sprites/mainbase/level6/Main_Base_LVL6_1.png",
  Mainbase7 = "sprites/mainbase/level7/Main_Base_LVL7_1.png",
  Mainbase8 = "sprites/mainbase/level8/Main_Base_LVL8_1.png",

  IronMine1 = "sprites/miners/ironmine/level1/Miner_Iron_LVL1_1.png",
  IronMine2 = "sprites/miners/ironmine/level2/Miner_Iron_LVL2_1.png",
  IronMine3 = "sprites/miners/ironmine/level3/Miner_Iron_LVL3_1.png",

  CopperMine1 = "sprites/miners/coppermine/level1/Miner_Copper_LVL1_1.png",
  CopperMine2 = "sprites/miners/coppermine/level2/Miner_Copper_LVL2_1.png",
  CopperMine3 = "sprites/miners/coppermine/level3/Miner_Copper_LVL3_1.png",

  LithiumMine1 = "sprites/miners/lithiummine/Miner_Lithium_LVL1_1.png",

  SulfurMine1 = "sprites/miners/sulfurmine/level1/Miner_Sulfur_LVL1_1.png",

  StorageUnit1 = "sprites/storage-facility/level1/Storage_Facility_LVL1.png",
  StorageUnit2 = "sprites/storage-facility/level2/Storage_Facility_LVL2.png",
  StorageUnit3 = "sprites/storage-facility/level3/Storage_Facility_LVL3_1.png",

  IronPlateFactory1 = "sprites/plating-factory/level1/Plating_Factory_LVL1_1.png",
  IronPlateFactory2 = "sprites/plating-factory/level1/Plating_Factory_LVL1_2.png",

  AlloyFactory1 = "sprites/alloy-factory/level1/Alloy_Factory1.png",
  AlloyFactory2 = "sprites/alloy-factory/level2/Alloy_Factory_LVL2_1.png",
  AlloyFactory3 = "sprites/alloy-factory/level3/Alloy_Factory_LVL3_1.png",

  SolarPanel1 = "sprites/solar-panels/level1/Solar_Panels_LVL1_1.png",
  SolarPanel2 = "sprites/solar-panels/level2/Solar_Panels_LVL2_1.png",

  PhotovoltaicCellFactory1 = "sprites/photovoltaic-cell-factory/level1/Photovoltaic_Factory_LVL1_1.png",
  PhotovoltaicCellFactory2 = "sprites/photovoltaic-cell-factory/level2/Photovoltaic_Factory_LVL2_1.png",

  StarmapperStation1 = "sprites/starmapper-station/level1/Starmapper1.png",

  Hangar1 = "sprites/hangar/level1/Hangar1.png",

  Garage1 = "sprites/garage/level1/Garage_LVL1_1.png",
  Garage2 = "sprites/garage/level2/Garage_LVL2_1.png",

  Workshop1 = "sprites/workshop/level1/Workshop_LVL1_1.png",
  Workshop2 = "sprites/workshop/level2/Workshop_LVL2_1.png",
  Workshop3 = "sprites/workshop/level3/Workshop_LVL1_3.png",

  DroneFactory1 = "sprites/drone-factory/normal/Drone_Factory1.png",

  SAMLauncher1 = "sprites/sam_launcher/level1/SAM_Launcher_LVL1_1.png",
  SAMLauncher2 = "sprites/sam_launcher/level2/SAM_Launcher_LVL2_1.png",
  SAMLauncher3 = "sprites/sam_launcher/level3/SAM_Launcher_LVL3_1.png",

  ShieldGenerator1 = "sprites/shield-generator/level1/Shield_Generator_LVL1_1.png",
  ShieldGenerator2 = "sprites/shield-generator/level2/Shield_Generator_LVL2_1.png",
  ShieldGenerator3 = "sprites/shield-generator/level3/Shield_Generator_LVL3_1.png",

  Vault1 = "sprites/vault/level1/Vault_LVL1_1.png",
  Vault2 = "sprites/vault/level2/Vault_LVL2_1.png",
  Vault3 = "sprites/vault/level3/Vault_LVL3_1.png",

  //ASTEROIDS
  Asteroid1 = "sprites/spacerocks/asteroids/asteroid1.png",
  Asteroid2 = "sprites/spacerocks/asteroids/asteroid2.png",
  Asteroid3 = "sprites/spacerocks/asteroids/asteroid3.png",
  Asteroid4 = "sprites/spacerocks/asteroids/asteroid4.png",
  Asteroid5 = "sprites/spacerocks/asteroids/asteroid5.png",

  //PIRATE ASTEROIDS
  PirateAsteroid1 = "sprites/spacerocks/pirate_asteroids/Pirate_Asteroid1.png",
  PirateAsteroid2 = "sprites/spacerocks/pirate_asteroids/Pirate_Asteroid2.png",

  //MOTHERLODES
  MotherlodeIridiumSmall = "sprites/spacerocks/motherlodes/motherlode_iridium_small.png",
  MotherlodeIridiumMedium = "sprites/spacerocks/motherlodes/motherlode_iridium_medium.png",
  MotherlodeIridiumLarge = "sprites/spacerocks/motherlodes/motherlode_iridium_large.png",

  MotherlodeTitaniumSmall = "sprites/spacerocks/motherlodes/motherlode_titanium_small.png",
  MotherlodeTitaniumMedium = "sprites/spacerocks/motherlodes/motherlode_titanium_medium.png",
  MotherlodeTitaniumLarge = "sprites/spacerocks/motherlodes/motherlode_titanium_large.png",

  MotherlodeKimberliteSmall = "sprites/spacerocks/motherlodes/motherlode_kimberlite_small.png",
  MotherlodeKimberliteMedium = "sprites/spacerocks/motherlodes/motherlode_kimberlite_medium.png",
  MotherlodeKimberliteLarge = "sprites/spacerocks/motherlodes/motherlode_kimberlite_large.png",

  MotherlodePlatinumSmall = "sprites/spacerocks/motherlodes/motherlode_platinum_small.png",
  MotherlodePlatinumMedium = "sprites/spacerocks/motherlodes/motherlode_platinum_medium.png",
  MotherlodePlatinumLarge = "sprites/spacerocks/motherlodes/motherlode_platinum_large.png",

  //ASTEROID BORDERS
  AsteroidPlayer = "sprites/spacerocks/borders/Border_Player.png",
  AsteroidEnemy = "sprites/spacerocks/borders/Border_Enemy.png",
  AsteroidPirate = "sprites/spacerocks/borders/Border_Pirate.png",
  AsteroidAlliance = "sprites/spacerocks/borders/Border_Alliance.png",

  MotherlodePlayerSmall = "sprites/spacerocks/borders/Border_Player_Motherlode1.png",
  MotherlodePlayerMedium = "sprites/spacerocks/borders/Border_Player_Motherlode2.png",
  MotherlodePlayerLarge = "sprites/spacerocks/borders/Border_Player_Motherlode3.png",

  MotherlodeNeutralSmall = "sprites/spacerocks/borders/Border_Enemy_Neutral1.png",
  MotherlodeNeutralMedium = "sprites/spacerocks/borders/Border_Enemy_Neutral2.png",
  MotherlodeNeutralLarge = "sprites/spacerocks/borders/Border_Enemy_Neutral3.png",

  MotherlodeEnemySmall = "sprites/spacerocks/borders/Border_Enemy_Motherlode1.png",
  MotherlodeEnemyMedium = "sprites/spacerocks/borders/Border_Enemy_Motherlode2.png",
  MotherlodeEnemyLarge = "sprites/spacerocks/borders/Border_Enemy_Motherlode3.png",

  MotherlodeAllianceSmall = "sprites/spacerocks/borders/Border_Alliance_Motherlode1.png",
  MotherlodeAllianceMedium = "sprites/spacerocks/borders/Border_Alliance_Motherlode2.png",
  MotherlodeAllianceLarge = "sprites/spacerocks/borders/Border_Alliance_Motherlode3.png",

  //CONSTRUCTION
  Construction1x1 = "sprites/construction/1x1.png",
  Construction2x2 = "sprites/construction/2x2.png",
  Construction3x3 = "sprites/construction/3x3.png",
  Construction4x4 = "sprites/construction/4x4.png",
  Construction2x3 = "sprites/construction/2x3.png",

  // GRACE PERIOD
  GracePeriod = "sprites/icons/grace.png",
}

export enum AnimationKeys {
  Mainbase1 = "mainbase/level1",
  Mainbase2 = "mainbase/level2",
  Mainbase3 = "mainbase/level3",
  Mainbase4 = "mainbase/level4",
  Mainbase5 = "mainbase/level5",
  Mainbase6 = "mainbase/level6",
  Mainbase7 = "mainbase/level7",
  Mainbase8 = "mainbase/level8",

  IronMine1 = "ironmine/level1",
  IronMine2 = "ironmine/level2",
  IronMine3 = "ironmine/level3",

  CopperMine1 = "coppermine/level1",
  CopperMine2 = "coppermine/level2",
  CopperMine3 = "coppermine/level3",

  LithiumMine1 = "lithiummine/level1",

  SulfurMine1 = "sulfurmine/level1",

  StorageUnit3 = "storageunit/level3",

  IronPlateFactory1 = "ironplatefactory/level1",
  IronPlateFactory2 = "ironplatefactory/level2",

  AlloyFactory1 = "alloyfactory/level1",
  AlloyFactory2 = "alloyfactory/level2",
  AlloyFactory3 = "alloyfactory/level3",

  PhotovoltaicCellFactory1 = "pvcfactory/level1",
  PhotovoltaicCellFactory2 = "pvcfactory/level2",

  SolarPanel1 = "solarpanel/level1",
  SolarPanel2 = "solarpanel/level2",

  StarmapperStation1 = "starmapperstation/level1",

  Hangar1 = "hangar/level1",

  Garage1 = "garage/level1",
  Garage2 = "garage/level2",

  Workshop1 = "workshop/level1",
  Workshop2 = "workshop/level2",
  Workshop3 = "workshop/level3",

  DroneFactory1 = "dronefactory/level1",

  SAMLauncher1 = "samlauncher/level1",
  SAMLauncher2 = "samlauncher/level2",
  SAMLauncher3 = "samlauncher/level3",

  ShieldGenerator1 = "shieldgenerator/level1",
  ShieldGenerator2 = "shieldgenerator/level2",
  ShieldGenerator3 = "shieldgenerator/level3",

  Vault1 = "vault/level1",
  Vault2 = "vault/level2",
  Vault3 = "vault/level3",
}

export const ResourceToTilesetKey: { [key: number]: ResourceTilekeys } = {
  [EResource.Iron]: ResourceTilekeys.Iron,
  [EResource.Copper]: ResourceTilekeys.Copper,
  [EResource.Lithium]: ResourceTilekeys.Lithium,
  [EResource.Sulfur]: ResourceTilekeys.Sulfur,
};

export const EntitytoSpriteKey = {
  [EntityType.MainBase]: [
    SpriteKeys.Mainbase1,
    SpriteKeys.Mainbase2,
    SpriteKeys.Mainbase3,
    SpriteKeys.Mainbase4,
    SpriteKeys.Mainbase5,
    SpriteKeys.Mainbase6,
    SpriteKeys.Mainbase7,
    SpriteKeys.Mainbase8,
  ],

  [EntityType.IronMine]: [SpriteKeys.IronMine1, SpriteKeys.IronMine2, SpriteKeys.IronMine3],

  [EntityType.CopperMine]: [SpriteKeys.CopperMine1, SpriteKeys.CopperMine2, SpriteKeys.CopperMine3],

  [EntityType.SulfurMine]: [SpriteKeys.SulfurMine1],

  [EntityType.LithiumMine]: [SpriteKeys.LithiumMine1],

  [EntityType.StorageUnit]: [SpriteKeys.StorageUnit1, SpriteKeys.StorageUnit2, SpriteKeys.StorageUnit3],

  [EntityType.IronPlateFactory]: [SpriteKeys.IronPlateFactory1, SpriteKeys.IronPlateFactory2],

  [EntityType.AlloyFactory]: [SpriteKeys.AlloyFactory1, SpriteKeys.AlloyFactory2, SpriteKeys.AlloyFactory3],

  [EntityType.PVCellFactory]: [SpriteKeys.PhotovoltaicCellFactory1, SpriteKeys.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [SpriteKeys.SolarPanel1, SpriteKeys.SolarPanel2],

  [EntityType.StarmapperStation]: [SpriteKeys.StarmapperStation1],

  [EntityType.Hangar]: [SpriteKeys.Hangar1],

  [EntityType.Garage]: [SpriteKeys.Garage1, SpriteKeys.Garage2],

  [EntityType.Workshop]: [SpriteKeys.Workshop1, SpriteKeys.Workshop2, SpriteKeys.Workshop3],

  [EntityType.SAMLauncher]: [SpriteKeys.SAMLauncher1, SpriteKeys.SAMLauncher2, SpriteKeys.SAMLauncher3],

  [EntityType.DroneFactory]: [SpriteKeys.DroneFactory1],

  [EntityType.ShieldGenerator]: [SpriteKeys.ShieldGenerator1, SpriteKeys.ShieldGenerator2, SpriteKeys.ShieldGenerator3],
  [EntityType.Vault]: [SpriteKeys.Vault1, SpriteKeys.Vault2, SpriteKeys.Vault3],

  //STARMAP
  [EntityType.Asteroid]: [
    SpriteKeys.Asteroid1,
    SpriteKeys.Asteroid2,
    SpriteKeys.Asteroid2,
    SpriteKeys.Asteroid3,
    SpriteKeys.Asteroid3,
    SpriteKeys.Asteroid4,
    SpriteKeys.Asteroid4,
    SpriteKeys.Asteroid5,
    SpriteKeys.Asteroid5,
  ],
};

// Array index corresponds to lvl
export const EntityIDtoAnimationKey = {
  [EntityType.MainBase]: [
    AnimationKeys.Mainbase1,
    AnimationKeys.Mainbase2,
    AnimationKeys.Mainbase3,
    AnimationKeys.Mainbase4,
    AnimationKeys.Mainbase5,
    AnimationKeys.Mainbase6,
    AnimationKeys.Mainbase7,
    AnimationKeys.Mainbase8,
  ],

  [EntityType.IronMine]: [AnimationKeys.IronMine1, AnimationKeys.IronMine2, AnimationKeys.IronMine3],
  [EntityType.CopperMine]: [AnimationKeys.CopperMine1, AnimationKeys.CopperMine2, AnimationKeys.CopperMine3],
  [EntityType.LithiumMine]: [AnimationKeys.LithiumMine1],
  [EntityType.SulfurMine]: [AnimationKeys.SulfurMine1],
  [EntityType.StorageUnit]: [undefined, undefined, AnimationKeys.StorageUnit3],

  [EntityType.IronPlateFactory]: [AnimationKeys.IronPlateFactory1, AnimationKeys.IronPlateFactory2],

  [EntityType.AlloyFactory]: [AnimationKeys.AlloyFactory1, AnimationKeys.AlloyFactory2, AnimationKeys.AlloyFactory3],

  [EntityType.PVCellFactory]: [AnimationKeys.PhotovoltaicCellFactory1, AnimationKeys.PhotovoltaicCellFactory2],

  [EntityType.SolarPanel]: [AnimationKeys.SolarPanel1, AnimationKeys.SolarPanel2],

  [EntityType.StarmapperStation]: [AnimationKeys.StarmapperStation1],

  [EntityType.Hangar]: [AnimationKeys.Hangar1],

  [EntityType.Garage]: [AnimationKeys.Garage1, AnimationKeys.Garage2],

  [EntityType.Workshop]: [AnimationKeys.Workshop1, AnimationKeys.Workshop2, AnimationKeys.Workshop3],

  [EntityType.DroneFactory]: [AnimationKeys.DroneFactory1],

  [EntityType.SAMLauncher]: [AnimationKeys.SAMLauncher1, AnimationKeys.SAMLauncher2, AnimationKeys.SAMLauncher3],

  [EntityType.ShieldGenerator]: [
    AnimationKeys.ShieldGenerator1,
    AnimationKeys.ShieldGenerator2,
    AnimationKeys.ShieldGenerator3,
  ],

  [EntityType.Vault]: [AnimationKeys.Vault1, AnimationKeys.Vault2, AnimationKeys.Vault3],
};

export enum KeybindActions {
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
  Research,
  Inventory,
  Mute,
  MainMenu,
  Esc,
  Debug,
  DeleteBuilding,
  Modifier,
  ToggleUI,
  NextHotbar,
  PrevHotbar,
  Map,
}
