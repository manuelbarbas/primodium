import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createCameraApi } from "src/game/api/camera";
import { createFxApi } from "src/game/api/fx";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getFleetTilePosition } from "src/util/unit";

export const renderEffects = (scene: Scene) => {
  const gameWorld = namespaceWorld(world, "game");
  const { BattleResult } = components;

  /* Can we pass in the custom scene instead of building it again here? */
  const fx = createFxApi(scene);
  const camera = createCameraApi(scene);

  const attackAnimation = async (attacker: Entity, defender: Entity, attackerWinner?: boolean) => {
    components.FleetMovement.pauseUpdates(attacker);
    const isPirate = components.PirateAsteroid.has(defender);
    if (isPirate) {
      components.PirateAsteroid.pauseUpdates(defender);
      components.Position.pauseUpdates(defender);
    }

    const isFleet = components.IsFleet.get(defender)?.value;
    if (isFleet) components.FleetMovement.pauseUpdates(defender);
    const attackerPosition = getFleetTilePosition(scene, attacker);
    const position = isFleet ? getFleetTilePosition(scene, defender) : components.Position.get(defender);
    const playerEntity = components.Account.get()?.value;
    const attackerRock = components.FleetMovement.get(attacker)?.destination as Entity;
    if (!position || !playerEntity) return;
    components.BattleRender.set({ value: attackerRock });
    const { emitExplosion, fireMissile } = fx;
    fireMissile(attackerPosition, position, { offsetMs: 50, numMissiles: 5 });
    const duration = fireMissile(position, attackerPosition, { delay: 500, offsetMs: 50, numMissiles: 5 });

    setTimeout(() => {
      emitExplosion(attackerWinner ? position : attackerPosition, "sm");
      if (defender === playerEntity || attacker === playerEntity) {
        const { shake } = camera;
        shake();
      }
      components.FleetMovement.unpauseUpdates(attacker);
      components.FleetMovement.unpauseUpdates(defender);
      if (isPirate) {
        components.PirateAsteroid.unpauseUpdates(defender);
        components.Position.unpauseUpdates(defender);
      }
    }, duration * 0.9);

    setTimeout(() => {
      components.BattleRender.clear();
    }, duration * 1.2);
  };

  defineComponentSystem(gameWorld, BattleResult, (update) => {
    const now = components.Time.get()?.value ?? 0n;

    const battle = components.Battle.get(update.entity);

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const destination = components.Position.get(battle.rock as Entity);
    if (!destination) return;

    attackAnimation(battle.attacker, battle.defender, battle.attacker === battle.winner);
  });
};
