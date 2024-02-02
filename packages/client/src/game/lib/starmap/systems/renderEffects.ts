import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createFxApi } from "src/game/api/fx";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const renderEffects = (scene: Scene) => {
  const gameWorld = namespaceWorld(world, "game");
  const { BattleResult } = components;

  /* Can we pass in the custom scene instead of building it again here? */
  const fx = createFxApi(scene);
  const camera = createCameraApi(scene);

  const attackAnimation = async (attacker: Entity, defender: Entity) => {
    fx;
    camera;
    attacker;
    defender;
    // const { emitExplosion } = fx;
    // emitExplosion(defendPosition);
    // if (battle.defender === playerEntity || battle.attacker === playerEntity) {
    //       const { shake } = camera;
    //       shake();
    //     }
  };

  defineComponentSystem(gameWorld, BattleResult, (update) => {
    const now = components.Time.get()?.value ?? 0n;

    const battle = components.Battle.get(update.entity);

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const destination = components.Position.get(battle.rock as Entity);
    if (!destination) return;

    attackAnimation(battle.attacker, battle.defender);
  });
};
