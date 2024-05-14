import { PrimodiumScene } from "@/game/api/scene";
import { WormholeBase } from "@/game/lib/objects/Building/Wormhole";
import { components } from "@/network/components";
import { world } from "@/network/world";
import { EntityType } from "@/util/constants";
import { defineComponentSystem, Entity, namespaceWorld } from "@latticexyz/recs";

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
    wormholeBuilding.setWormholeState(time > -cooldownEnd ? "cooldown" : "idle");

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

    defineComponentSystem(
      wormholeWorld,
      components.Time,
      ({ value }) => {
        const time = value[0]?.value ?? 0n;
        const cooldownEnd = components.CooldownEnd.get(mainBase)?.value ?? 0n;
        if (time !== cooldownEnd) return;
        const wormholeBuilding = scene.objects.building.get(mainBase) as WormholeBase;
        wormholeBuilding.runPowerUpAnimation();
      },
      { runOnInit: false }
    );
  });
};
