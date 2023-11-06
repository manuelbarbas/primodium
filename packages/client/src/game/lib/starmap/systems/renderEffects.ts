import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";
import { getNow } from "src/util/time";

export const renderEffects = (scene: Scene, mud: SetupResult) => {
  const playerEntity = mud.network.playerEntity;
  const gameWorld = namespaceWorld(world, "game");
  const { BattleResult } = components;
  defineComponentSystem(gameWorld, BattleResult, (update) => {
    const now = getNow();

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
