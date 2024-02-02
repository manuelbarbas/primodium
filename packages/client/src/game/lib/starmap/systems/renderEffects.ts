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

  const attackAnimation = async (attacker: Entity, defender: Entity) => {
    const { tileWidth, tileHeight } = scene.tilemap;
    const isFleet = components.IsFleet.get(defender)?.value;
    const attackerPosition = getFleetTilePosition(attacker, { tileHeight, tileWidth });
    console.log("attacker position:", attackerPosition);
    const position = isFleet
      ? getFleetTilePosition(defender, { tileHeight, tileWidth })
      : components.Position.get(defender);
    console.log("defender position:", position);
    const playerEntity = components.Account.get()?.value;
    if (!position || !playerEntity) return;
    const { emitExplosion, fireMissile } = fx;
    const duration = fireMissile(attackerPosition, position);

    setTimeout(() => {
      emitExplosion(position, isFleet ? "sm" : "md");
      if (defender === playerEntity || attacker === playerEntity) {
        const { shake } = camera;
        shake();
      }
    }, duration * 0.8);
  };

  defineComponentSystem(gameWorld, components.HoverEntity, (update) => {
    const activeFleet = components.SelectedFleet.get()?.fleet;
    const hoverEntity = update.value[0]?.value;
    if (activeFleet && hoverEntity) attackAnimation(activeFleet, hoverEntity);
  });

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
