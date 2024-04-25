//tilesets
import plain from "./tilesets/images/plain.png?url";
import patches from "./tilesets/images/patches.png?url";
import lightPatches from "./tilesets/images/light-patches.png?url";
import walls from "./tilesets/images/walls.png?url";
import wallShadows from "./tilesets/images/wall_shadows.png?url";
import craters from "./tilesets/images/craters.png?url";
import decorations from "./tilesets/images/decorations.png?url";
import fog from "./tilesets/images/fog.png?url";
import darkFog from "./tilesets/images/dark-fog.png?url";
import ores from "./tilesets/images/ores.png?url";
import nonBuildable from "./tilesets/images/bounds-nonbuildable.png?url";
import outerBorder from "./tilesets/images/bounds-outerborder.png?url";
import innerBorder from "./tilesets/images/bounds-innerborder.png?url";

//sprite atlas and texture
import spriteAtlas from "./atlas/sprites/atlas.json?url";
import spriteAtlasTexture from "./atlas/sprites/atlas.png?url";

//audio atlas
import audioAtlas from "./atlas/audio/atlas.json?url";

//audio sprites
import audioMp3 from "./atlas/audio/atlas.mp3?url";
import audioOgg from "./atlas/audio/atlas.ogg?url";
import audioM4a from "./atlas/audio/atlas.m4a?url";
import audioAc3 from "./atlas/audio/atlas.ac3?url";

//tilemaps
import asteroidMicro from "./maps/asteroid-micro.tmj?url";
import asteroidSmall from "./maps/asteroid-small.tmj?url";
import asteroidMedium from "./maps/asteroid-medium.tmj?url";
import asteroidLarge from "./maps/asteroid-large.tmj?url";

//fonts
import teletactile from "./fonts/bitmap/teletactile/teletactile.png?url";
import teletactileXML from "./fonts/bitmap/teletactile/teletactile.xml?url";
import { PackConfig } from "types";

export const pack: PackConfig = {
  image: [
    {
      key: "plain",
      url: plain,
    },
    {
      key: "patches",
      url: patches,
    },
    {
      key: "light-patches",
      url: lightPatches,
    },
    {
      key: "walls",
      url: walls,
    },
    {
      key: "wall_shadows",
      url: wallShadows,
    },
    {
      key: "craters",
      url: craters,
    },
    {
      key: "decorations",
      url: decorations,
    },
    {
      key: "fog",
      url: fog,
    },
    {
      key: "dark-fog",
      url: darkFog,
    },
    {
      key: "resource",
      url: ores,
    },
    {
      key: "bounds-nonbuildable",
      url: nonBuildable,
    },
    {
      key: "bounds-outerborder",
      url: outerBorder,
    },
    {
      key: "bounds-innerborder",
      url: innerBorder,
    },
  ],
  audioSprite: [
    {
      key: "audio-atlas",
      urls: [audioMp3, audioOgg, audioM4a, audioAc3],
      jsonURL: audioAtlas,
    },
  ],
  atlas: [
    {
      key: "sprite-atlas",
      textureURL: spriteAtlasTexture,
      atlasURL: spriteAtlas,
    },
  ],
  tilemapTiledJSON: [
    {
      key: "asteroid-micro",
      url: asteroidMicro,
    },
    {
      key: "asteroid-small",
      url: asteroidSmall,
    },
    {
      key: "asteroid-medium",
      url: asteroidMedium,
    },
    {
      key: "asteroid-large",
      url: asteroidLarge,
    },
  ],
  bitmapFont: [
    {
      key: "teletactile",
      textureURL: teletactile,
      fontDataURL: teletactileXML,
    },
  ],
};
