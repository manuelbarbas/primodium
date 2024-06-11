import { Core } from "@/lib/types";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

export function setupTrainingQueues(core: Core) {
  const {
    network: { world },
    tables,
    utils: { updateTrainingQueues },
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const { SelectedRock } = tables;

  // update local queues each second
  // todo: create a component that tracks active asteroids (to be updated each second)
  defineComponentSystem(systemWorld, tables.Time, () => {
    const activeRock = tables.ActiveRock.get()?.value;
    const selectedRock = SelectedRock.get()?.value;
    const parents: Entity[] = [];
    if (selectedRock) parents.push(selectedRock);
    if (activeRock && selectedRock !== activeRock) parents.push(activeRock);

    parents.forEach((asteroid) => updateTrainingQueues(asteroid));
  });

  defineComponentSystem(systemWorld, tables.HoverEntity, ({ value: values }) => {
    const hoverEntity = values[0]?.value;
    if (!hoverEntity || !tables.Asteroid.has(hoverEntity)) return;
    updateTrainingQueues(hoverEntity);
  });
}
