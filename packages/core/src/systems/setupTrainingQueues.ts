import { SetupResult } from "@/lib/types";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";

export function setupTrainingQueues(setupResult: SetupResult) {
  const {
    network: { world },
    components,
    utils: { updateTrainingQueues },
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const { SelectedRock } = components;

  // update local queues each second
  // todo: create a component that tracks active asteroids (to be updated each second)
  defineComponentSystem(systemWorld, components.Time, () => {
    const activeRock = components.ActiveRock.get()?.value;
    const selectedRock = SelectedRock.get()?.value;
    const parents: Entity[] = [];
    if (selectedRock) parents.push(selectedRock);
    if (activeRock && selectedRock !== activeRock) parents.push(activeRock);

    parents.forEach((asteroid) => updateTrainingQueues(asteroid));
  });

  defineComponentSystem(systemWorld, components.HoverEntity, ({ value: values }) => {
    const hoverEntity = values[0]?.value;
    if (!hoverEntity || !components.Asteroid.has(hoverEntity)) return;
    updateTrainingQueues(hoverEntity);
  });
}
