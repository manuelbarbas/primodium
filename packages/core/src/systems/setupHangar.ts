import { Entity, Has, HasValue, defineComponentSystem, namespaceWorld, runQuery } from "@latticexyz/recs";
import { Hex } from "viem";
import { EntityType } from "@/lib/constants";
import { Core } from "@/lib/types";

export function setupHangar(core: Core) {
  const {
    network: { world },
    tables,
    utils: { getUnitTrainingTime, getAsteroidDroidCount },
  } = core;
  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, tables.SelectedRock, ({ value: [value] }) => {
    if (!value?.value) return;
    createHangar(value.value);
  });

  defineComponentSystem(systemWorld, tables.HoverEntity, ({ value: [value] }) => {
    const entity = value?.value;
    if (!entity) return;
    if (tables.Asteroid.has(entity)) createHangar(entity);
  });

  defineComponentSystem(systemWorld, tables.Time, () => {
    const selectedRock = tables.ActiveRock.get()?.value as Entity;
    if (selectedRock) createHangar(selectedRock);
    const hoverEntity = tables.HoverEntity.get()?.value as Entity;
    if (tables.Asteroid.has(hoverEntity)) createHangar(hoverEntity);
  });

  function createHangar(spaceRock: Entity) {
    const units: Map<Entity, bigint> = new Map();

    // get all units and find their counts on the space rock
    tables.P_UnitPrototypes.get()?.value.forEach((entity) => {
      const unitCount = tables.UnitCount.getWithKeys({
        entity: spaceRock as Hex,
        unit: entity as Hex,
      })?.value;

      if (!unitCount) return;
      const prev = units.get(entity as Entity) || 0n;
      units.set(entity as Entity, prev + unitCount);
    });

    const trainedUnclaimedUnits = getTrainedUnclaimedUnits(spaceRock);
    Array.from(trainedUnclaimedUnits).map(([unit, count]) => {
      units.set(unit as Entity, (units.get(unit as Entity) ?? 0n) + count);
    });

    units.set(EntityType.Droid, getAsteroidDroidCount(spaceRock));

    const value = { units: [...units.keys()], counts: [...units.values()] };
    tables.Hangar.set(value, spaceRock);
    return units;
  }

  function getTrainedUnclaimedUnits(spaceRock: Entity) {
    const units = new Map<Entity, bigint>();
    const query = [
      Has(tables.TrainingQueue),
      HasValue(tables.Position, {
        parentEntity: spaceRock,
      }),
    ];
    const buildings = runQuery(query);
    const config = tables.P_GameConfig.get();
    if (!config) return units;
    buildings.forEach((building) => {
      const owner = tables.OwnedBy.get(building)?.value;

      let startTime =
        tables.LastClaimedAt.get(building, { value: 0n }).value - tables.ClaimOffset.get(building, { value: 0n }).value;

      const queueUnits = tables.Meta_UnitProductionQueue.getWithKeys({ entity: building as Hex });
      if (!queueUnits || !owner || !startTime) return tables.Hangar.remove(building);
      for (let i = queueUnits.front; i <= queueUnits.back; i++) {
        const update = tables.Value_UnitProductionQueue.getWithKeys({ entity: building as Hex, index: i });
        if (!update) continue;

        const trainingTime = getUnitTrainingTime(owner as Entity, building, update.unitEntity as Entity);
        let trainedUnits = update.quantity;
        const now = tables.Time.get()?.value ?? 0n;
        if (trainingTime > 0) trainedUnits = (now - startTime) / trainingTime;

        if (trainedUnits == 0n) return;

        if (trainedUnits > update.quantity) {
          trainedUnits = update.quantity;
        }
        units.set(update.unitEntity as Entity, trainedUnits);

        startTime += trainingTime * trainedUnits;
      }
    });
    return units;
  }
}
