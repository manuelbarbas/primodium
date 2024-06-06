import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { EntityType } from "@primodiumxyz/core/util/constants";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";

import { PrimodiumScene } from "@/api/scene";
import { WormholeBase } from "@/lib/objects/building/Wormhole";

export const renderWormholeAnimations = (scene: PrimodiumScene) => {
  // subscribe to cooldown end for main base
  const systemsWorld = namespaceWorld(world, "systems");
  const wormholeWorld = namespaceWorld(world, "wormholeSystems");
  world.dispose("wormholeSystems");
  defineComponentSystem(systemsWorld, components.ActiveRock, async ({ value }) => {
    const activeRock = value[0]?.value as Entity;
    if (!activeRock) return;
    const mainBase = components.Home.get(activeRock)?.value as Entity | undefined;
    const mainBaseIsWormhole = components.BuildingType.get(mainBase)?.value === EntityType.WormholeBase;

    if (!mainBase || !mainBaseIsWormhole) return;
    const time = components.Time.get()?.value ?? 0n;
    const cooldownEnd = components.CooldownEnd.get(mainBase)?.value ?? 0n;
    const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
    wormholeBuilding.setWormholeState(cooldownEnd !== 0n && time < cooldownEnd ? "cooldown" : "idle");

    defineComponentSystem(
      wormholeWorld,
      components.CooldownEnd,
      ({ entity, value }) => {
        if (entity !== mainBase) return;
        const time = components.Time.get(entity)?.value ?? 0n;
        const newCooldown = value[0]?.value ?? 0n;
        if (newCooldown < time) return;
        const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
        wormholeBuilding.runExplosionAnimation();
      },
      { runOnInit: false }
    );

    let currentResource = components.WormholeResource.get()?.resource;
    const updateResource = (newResource: Entity) => {
      if (newResource && currentResource !== newResource) {
        wormholeBuilding.runChangeResourceAnimation(newResource);
        currentResource = newResource;
      }
    };

    const powerUp = (time: bigint) => {
      const cooldownEnd = components.CooldownEnd.get(mainBase)?.value ?? 0n;
      if (time !== cooldownEnd) return;
      const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
      wormholeBuilding.runPowerUpAnimation();
    };

    defineComponentSystem(
      wormholeWorld,
      components.Time,
      ({ value }) => {
        const resource = components.WormholeResource.get()?.resource;
        if (resource) updateResource(resource);
        powerUp(value[0]?.value ?? 0n);
      },
      { runOnInit: false }
    );
  });
};
