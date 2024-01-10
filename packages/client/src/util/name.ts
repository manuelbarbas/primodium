import { Entity } from "@latticexyz/recs";
import { isPlayer } from "./common";
import { hashEntities } from "./encode";

const adjectives = [
  "Stellar",
  "Cosmic",
  "Galactic",
  "Lunar",
  "Solar",
  "Interstellar",
  "Celestial",
  "Orbital",
  "Astral",
  "Starlit",
  "Meteor",
  "Nebular",
  "Quantum",
  "Void",
  "Comet",
  "Eclipse",
  "Nova",
  "Supernova",
  "Satellite",
  "Planetary",
  "Gravity",
  "Orbit",
  "Zodiac",
  "Milky",
  "Photon",
  "Galaxy",
  "Cosmos",
  "DarkMatter",
  "Astro",
  "Nebula",
];

const nouns = [
  "Voyager",
  "Orion",
  "Andromeda",
  "Pulsar",
  "Quasar",
  "BlackHole",
  "Spacecraft",
  "Asteroid",
  "Galaxy",
  "Nebula",
  "Starship",
  "Meteorite",
  "Cosmonaut",
  "Astronaut",
  "Satellite",
  "Comet",
  "Planetoid",
  "Star",
  "Moon",
  "Sun",
  "Universe",
  "Wormhole",
  "Spacesuit",
  "Telescope",
  "Astrolab",
  "Rocket",
  "Mars",
  "Venus",
  "Mercury",
  "Jupiter",
];

const entityPlayerName = new Map<Entity, string>();
export const entityToPlayerName = (entity: Entity | undefined) => {
  if (!entity) return "Unowned";
  if (!isPlayer(entity)) return "Pirate";
  if (entityPlayerName.has(entity)) return entityPlayerName.get(entity) as string;

  const hash = hashEntities(entity);

  const adjIndex = parseInt(hash.substring(0, 8), 16) % adjectives.length;
  const nounIndex = parseInt(hash.substring(8, 16), 16) % nouns.length;
  const number = parseInt(hash.substring(16, 20), 16) % 100;

  const name = `${adjectives[adjIndex]}.${nouns[nounIndex]}-${number}`;

  entityPlayerName.set(entity, name);
  return name;
};

const entityRockname = new Map<Entity, string>();
export const entityToRockName = (entity: Entity) => {
  if (entityRockname.has(entity)) return entityRockname.get(entity) as string;

  const hash = hashEntities(entity);

  const prefix1 = parseInt(hash.substring(0, 4), 16) % 26;
  const prefix2 = parseInt(hash.substring(4, 8), 16) % 26;
  const number = parseInt(hash.substring(8, 12), 16) % 251;
  const suffix = parseInt(hash.substring(12, 16), 16) % 26;

  const name = `${String.fromCharCode(65 + prefix1)}${String.fromCharCode(
    65 + prefix2
  )} ${number} ${String.fromCharCode(65 + suffix)}`;

  entityRockname.set(entity, name);

  return name;
};
