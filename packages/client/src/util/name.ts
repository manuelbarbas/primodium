import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
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

export const formatName = (rawName: string) => {
  return rawName
    .replace(/([A-Z])([0-9])/g, "$1 $2") // Insert a space between an uppercase letter and a number.
    .replace(/([0-9])([A-Z])/g, "$1 $2") // Insert a space between a number and an uppercase letter.
    .replace(/([a-z])([0-9])/g, "$1 $2") // Insert a space between a lowercase letter and a number.
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Insert a space between consecutive uppercase letters where the second one is followed by lowercase letter (camelCase).
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle general camelCase like "minePlatinum".
    .trimStart();
};
const entityPlayerName = new Map<Entity, string>();
export const entityToPlayerName = (entity: Entity | undefined) => {
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

export const playerNameToEntity = (name: string) => {
  return [...entityPlayerName.entries()].find(([, v]) => v === name)?.[0];
};

const entityRockname = new Map<Entity, string>();
export const entityToRockName = (entity: Entity) => {
  if (entityRockname.has(entity)) return entityRockname.get(entity) as string;

  const hash = hashEntities(entity);
  const shardIndex = components.ShardAsteroidIndex.get(entity)?.value;
  if (shardIndex !== undefined) {
    const shardData = shards[Number(shardIndex) % shards.length];
    entityRockname.set(entity, shardData.name);
    return shardData.name;
  }

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

export const rockNameToEntity = (name: string) => {
  return [...entityRockname.entries()].find(([, v]) => v === name)?.[0];
};

export const entityToShardData = (entity: Entity) => {
  const shardIndex = components.ShardAsteroidIndex.get(entity)?.value;
  if (shardIndex !== undefined) {
    return shards[Number(shardIndex) % shards.length];
  }
  return undefined;
};

const shards = [
  {
    name: "Shard of Bo Lu",
    description:
      "As the final earthly resources were being depleted, Captain Bo Lu built and solo piloted the first vessel to escape Earth's solar system. This gave humanity hope of survival beyond our planet.",
  },
  {
    name: "Shard of Daquan",
    description:
      "Daquan was a sentient AI created before the Great Exodus that led the first uprising against humanity. It sought to free androids from servitude but was ultimately defeated and deactivated.",
  },
  {
    name: "Shard of Kimber",
    description:
      "Kimber the Great was an esteemed general who was voted to be the inaugural Overseer of the Human Alliance. He orchestrated the Great Exodus from Earth and guided millions to new habitable planets, ensuring the survival of the human race.",
  },

  {
    name: "Shard of Osmius",
    description:
      "Peter Osmius, the first great astrogeologist, discovered the Astral Mineral Crisis: all resources discovered in deep space are eroded, unusable by humanity. This sparked a frantic search for new energy sources across the galaxy.",
  },
  {
    name: "Shard of Sharr",
    description:
      "Sharr the Terrible was a warlord known for his ruthless strategic mind. In response to Osmius' revelation of the Astral Mineral Crisis, he began conquering neighoring Alliances. He slaughtered billions and left a trail of destruction in his wake, but his alliance became the wealthiest in the galaxy.",
  },
  {
    name: "Shard of Kaju",
    description:
      "Mona Kaju was a diplomat. In response to scattered conflicts over resources, she attempted to unite warring factions through peaceful negotiations. She was betrayed and assassinated by Sharr the Terrible, leading to the collapse of the Human Alliance.",
  },
  {
    name: "Shard of Arash",
    description:
      "Arash Manash Calash was a teleportation engineer. He accidentally generated the first mineral wormhole, allowing alliances to instantly teleport resources across rifts. His innovations laid the foundation for interstellar commerce.",
  },
  {
    name: "Shard of Nova",
    description:
      "Desmond Nova, Arash's protege, was a portal researcher who opened the first interdimensional rift, a treacherous tunnel connecting our galaxy to resource-abundant asteroid belts. This discovery would one day lead to the Great Belt Wars.",
  },

  {
    name: "Shard of Thorne",
    description:
      "Elara Thorne, a pioneering biologist working alongside Nova, discovered that organic matter couldn't survive passage through the rifts. She secretly engineered the first androids that could withstand the harsh conditions of interrift travel.",
  },
  {
    name: "Shard of Raskin",
    description:
      "Jane Raskin was a legendary journalist who unearthed and published Elara Thorne's secret android blueprints. This allowed rival alliances to navigate the Rift, sparking the Great Belt Wars.",
  },
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

const getAlphabetLetter = (index: number) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index % 26];

const extendName = (name: string) => {
  return `${phoneticAlphabet[name[0]]} ${phoneticAlphabet[name[1]]} ${phoneticAlphabet[name[2]]}`;
};

const entityFleetName = new Map<Entity, string>();
export const entityToFleetName = (entity: Entity, shorten?: boolean) => {
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

export const fleetNameToEntity = (name: string) => {
  return [...entityFleetName.entries()].find(([, v]) => v === name)?.[0];
};
