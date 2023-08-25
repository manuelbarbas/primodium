import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import {
  ActiveAsteroid,
  BlockNumber,
  Hangar,
} from "../components/clientComponents";
import { world } from "../world";
import {
  OwnedBy,
  P_UnitTravelSpeed,
  Units,
} from "../components/chainComponents";
import { hashEntities } from "src/util/encode";

export function setupHangar() {
  defineComponentSystem(world, BlockNumber, () => {
    const spaceRock = ActiveAsteroid.get()?.value;
    if (!spaceRock) return;
    const player = OwnedBy.get(spaceRock)?.value;
    if (!player) return;
    let units: EntityID[] = [];
    const counts: number[] = [];
    P_UnitTravelSpeed.getAll().forEach((entity) => {
      const hashedEntity = hashEntities(entity, player, spaceRock);
      const unitCount = Units.get(hashedEntity)?.value;
      if (!unitCount) return;
      units.push(entity);
      counts.push(unitCount);
    });
    Hangar.set({ units, counts });
  });
}
