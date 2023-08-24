import { EntityID } from "@latticexyz/recs";
import { ESpaceRockType } from "./web3/types";
import {
  AsteroidType,
  Motherlode,
} from "src/network/components/chainComponents";
import { MotherlodeSizeNames, MotherlodeTypeNames } from "./constants";

export function getAsteroidImage(asteroid: EntityID) {
  const type = AsteroidType.get(asteroid, { value: ESpaceRockType.Asteroid })
    .value as ESpaceRockType;

  if (type === ESpaceRockType.Asteroid)
    return "/img/spacerocks/asteroids/asteroid1.png";

  if (type === ESpaceRockType.Motherlode) {
    const motherlodeData = Motherlode.get(asteroid);
    if (!motherlodeData) return "";

    const resourceName = MotherlodeTypeNames[motherlodeData.motherlodeType];
    const resourceSize = MotherlodeSizeNames[motherlodeData.size];
    const img = `/img/spacerocks/motherlodes/motherlode_${resourceName}_${resourceSize}.png`;
    return img;
  }

  return "";
}
