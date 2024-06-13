import { Core, EntityType } from "@primodiumxyz/core";

import { PrimodiumScene } from "@/api/scene";
import { WormholeBase } from "@/lib/objects/building/Wormhole";
import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

export const renderWormholeAnimations = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  // subscribe to cooldown end for main base
  const systemsWorld = namespaceWorld(world, "systems");
  const wormholeWorld = namespaceWorld(world, "wormholeSystems");
  world.dispose("wormholeSystems");

  tables.ActiveRock.watch({
    world: systemsWorld,
    onUpdate: ({ properties: { current } }) => {
      const activeRock = current?.value;
      if (!activeRock) return;
      const mainBase = tables.Home.get(activeRock)?.value as Entity | undefined;
      const mainBaseIsWormhole = tables.BuildingType.get(mainBase)?.value === EntityType.WormholeBase;

      if (!mainBase || !mainBaseIsWormhole) return;
      const time = tables.Time.get()?.value ?? 0n;
      const cooldownEnd = tables.CooldownEnd.get(mainBase)?.value ?? 0n;
      const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
      wormholeBuilding.setWormholeState(cooldownEnd !== 0n && time < cooldownEnd ? "cooldown" : "idle");

      tables.CooldownEnd.watch(
        {
          world: wormholeWorld,
          onUpdate: ({ entity, properties: { current } }) => {
            if (entity !== mainBase) return;
            const time = tables.Time.get(entity)?.value ?? 0n;
            const newCooldown = current?.value ?? 0n;
            if (newCooldown < time) return;
            const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
            wormholeBuilding.runExplosionAnimation();
          },
        },
        { runOnInit: false }
      );

      let currentResource = tables.WormholeResource.get()?.resource;
      const updateResource = (newResource: Entity) => {
        if (newResource && currentResource !== newResource) {
          wormholeBuilding.runChangeResourceAnimation(newResource);
          currentResource = newResource;
        }
      };

      const powerUp = (time: bigint) => {
        const cooldownEnd = tables.CooldownEnd.get(mainBase)?.value ?? 0n;
        if (time !== cooldownEnd) return;
        const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
        wormholeBuilding.runPowerUpAnimation();
      };

      tables.Time.watch(
        {
          world: wormholeWorld,
          onUpdate: ({ properties: { current } }) => {
            const resource = tables.WormholeResource.get()?.resource;
            if (resource) updateResource(resource);
            powerUp(current?.value ?? 0n);
          },
        },
        { runOnInit: false }
      );
    },
  });
};
