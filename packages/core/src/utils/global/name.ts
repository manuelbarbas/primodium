import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { hashEntities } from "./encode";

const adjectives = [
  "Stellar",
  "Cosmic",
  "Galactic",
  "Lunar",
  "Solar",
  "Stellar",
  "Celestial",
  "Orbital",
  "Astral",
  "Starlit",
  "Meteoric",
  "Nebular",
  "Quantum",
  "Void",
  "Shining",
  "Eclipse",
  "Astric",
  "Supernovic",
  "Planetary",
  "Gravity",
  "Milky",
  "Photonic",
  "Dark",
  "Space",
  "Space",
  "Astro",
  "Nebulaic",
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
  "Neutron",
  "Spacesuit",
  "Telescope",
  "Astrolab",
  "Rocket",
  "Mars",
  "Venus",
  "Mercury",
  "Jupiter",
];

const phoneticAlphabet: Record<string, string> = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliet",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "Nova",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "Xray",
  Y: "Yankee",
  Z: "Zulu",
};

/**
 * Formats a raw name by inserting spaces and handling camelCase.
 * @param rawName - The raw name to format.
 * @returns The formatted name.
 */
export const formatName = (rawName: string): string => {
  return rawName
    .replace(/([A-Z])([0-9])/g, "$1 $2") // Insert a space between an uppercase letter and a number.
    .replace(/([0-9])([A-Z])/g, "$1 $2") // Insert a space between a number and an uppercase letter.
    .replace(/([a-z])([0-9])/g, "$1 $2") // Insert a space between a lowercase letter and a number.
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Insert a space between consecutive uppercase letters where the second one is followed by lowercase letter (camelCase).
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle general camelCase like "minePlatinum".
    .trimStart();
};

const entityPlayerName = new Map<Entity, string>();

/**
 * Converts an entity to a player name.
 * @param entity - The entity to convert.
 * @returns The player name.
 */
export const entityToPlayerName = (entity: Entity | undefined): string => {
  if (!entity || entity == singletonEntity) return "Nobody";
  if (entityPlayerName.has(entity)) return entityPlayerName.get(entity) as string;

  const hash = hashEntities(entity);

  const adjIndex = parseInt(hash.substring(0, 8), 16) % adjectives.length;
  const nounIndex = parseInt(hash.substring(8, 16), 16) % nouns.length;
  const number = parseInt(hash.substring(16, 20), 16) % 100;

  const name = `${adjectives[adjIndex]}.${nouns[nounIndex]}-${number}`;

  entityPlayerName.set(entity, name);
  return name;
};

/**
 * Converts a player name to an entity.
 * @param name - The player name.
 * @returns The entity.
 */
export const playerNameToEntity = (name: string): Entity | undefined => {
  return [...entityPlayerName.entries()].find(([, v]) => v === name)?.[0];
};

const entityRockname = new Map<Entity, string>();

/**
 * Converts an entity to a rock name.
 * @param entity - The entity to convert.
 * @returns The rock name.
 */
export const entityToRockName = (entity: Entity): string => {
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

/**
 * Converts a rock name to an entity.
 * @param name - The rock name.
 * @returns The entity.
 */
export const rockNameToEntity = (name: string): Entity | undefined => {
  return [...entityRockname.entries()].find(([, v]) => v === name)?.[0];
};

const getAlphabetLetter = (index: number) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index % 26];

const extendName = (name: string) => {
  return `${phoneticAlphabet[name[0]]} ${phoneticAlphabet[name[1]]} ${phoneticAlphabet[name[2]]}`;
};

const entityFleetName = new Map<Entity, string>();

/**
 * Converts an entity to a fleet name.
 * @param entity - The entity to convert.
 * @param shorten - Whether to shorten the fleet name.
 * @returns The fleet name.
 */
export const entityToFleetName = (entity: Entity, shorten?: boolean): string => {
  const fetched = entityFleetName.get(entity);
  if (fetched) return shorten ? fetched : extendName(fetched);

  const hash = hashEntities(entity);
  const index1 = parseInt(hash.substring(0, 8), 16) % 26;
  const index2 = parseInt(hash.substring(8, 16), 16) % 26;
  let index3 = parseInt(hash.substring(16, 32), 16) % 26;
  let name = `${getAlphabetLetter(index1)}${getAlphabetLetter(index2)}${getAlphabetLetter(index3)}`;
  while (fleetNameToEntity(name)) {
    index3 = (index3 + 1) % 26;
    name = `${getAlphabetLetter(index1)}${getAlphabetLetter(index2)}${getAlphabetLetter(index3)}`;
  }
  entityFleetName.set(entity, name);
  return shorten ? name : extendName(name);
};

/**
 * Converts a fleet name to an entity.
 * @param name - The fleet name.
 * @returns The entity.
 */
export const fleetNameToEntity = (name: string): Entity | undefined => {
  return [...entityFleetName.entries()].find(([, v]) => v === name)?.[0];
};
