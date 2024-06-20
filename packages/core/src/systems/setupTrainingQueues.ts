import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { Core } from "@/lib/types";

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
  tables.Time.watch({
    world: systemWorld,
    onChange: () => {
      const activeRock = tables.ActiveRock.get()?.value;
      const selectedRock = SelectedRock.get()?.value;
      const parents: Entity[] = [];
      if (selectedRock) parents.push(selectedRock);
      if (activeRock && selectedRock !== activeRock) parents.push(activeRock);

      parents.forEach((asteroid) => updateTrainingQueues(asteroid));
    },
  });

  tables.HoverEntity.watch({
    world: systemWorld,
    onChange: ({ properties }) => {
      const hoverEntity = properties.current?.value;
      if (!hoverEntity || !tables.Asteroid.has(hoverEntity)) return;

      updateTrainingQueues(hoverEntity);
    },
  });
}
