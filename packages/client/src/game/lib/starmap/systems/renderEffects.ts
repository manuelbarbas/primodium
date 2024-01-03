import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const renderEffects = () => {
  const gameWorld = namespaceWorld(world, "game");
  const { BattleResult } = components;
  defineComponentSystem(gameWorld, BattleResult, (update) => {
    const playerEntity = components.Account.get()?.value;
    const now = components.Time.get()?.value ?? 0n;

    const battle = update.value[0];

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const destination = components.Position.get(battle.rock as Entity);
    if (!destination) return;

    const { emitExplosion } = primodium.api(Scenes.Starmap).fx;
    emitExplosion(destination);

    if (battle.defender === playerEntity || battle.attacker === playerEntity) {
      const { shake } = primodium.api(Scenes.Starmap).camera;
      shake();
    }
  });
};
