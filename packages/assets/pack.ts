//tilesets
import plain from "./tile/tilesets/plain.png?url";
import patches from "./tile//tilesets/patches.png?url";
import lightPatches from "./tile/tilesets/light-patches.png?url";
import walls from "./tile/tilesets/walls.png?url";
import wallShadows from "./tile/tilesets/wall_shadows.png?url";
import craters from "./tile/tilesets/craters.png?url";
import decorations from "./tile/tilesets/decorations.png?url";
import fog from "./tile/tilesets/fog.png?url";
import darkFog from "./tile/tilesets/dark-fog.png?url";
import ores from "./tile/tilesets/ores.png?url";
import nonBuildable from "./tile/tilesets/bounds-nonbuildable.png?url";
import outerBorder from "./tile/tilesets/bounds-outerborder.png?url";
import innerBorder from "./tile/tilesets/bounds-innerborder.png?url";

//sprite atlas and texture
import spriteAtlas from "./atlas/sprites/atlas.json?url";
import spriteAtlasTexture from "./atlas/sprites/atlas.png?url";

//sprite atlas and texture
import vfxAtlas from "./atlas/vfx/atlas.json?url";
import vfxAtlasTexture from "./atlas/vfx/atlas.png?url";

//audio atlas
import audioAtlas from "./atlas/audio/atlas.json?url";

//audio sprites
import audioMp3 from "./atlas/audio/atlas.mp3?url";
import audioOgg from "./atlas/audio/atlas.ogg?url";
import audioM4a from "./atlas/audio/atlas.m4a?url";
import audioAc3 from "./atlas/audio/atlas.ac3?url";

//tilemaps
import asteroidMicro from "./tile/maps/asteroid-micro.tmj?url";
import asteroidSmall from "./tile/maps/asteroid-small.tmj?url";
import asteroidMedium from "./tile/maps/asteroid-medium.tmj?url";
import asteroidLarge from "./tile/maps/asteroid-large.tmj?url";

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
    {
      key: "vfx-atlas",
      textureURL: vfxAtlasTexture,
      atlasURL: vfxAtlas,
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
