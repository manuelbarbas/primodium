import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { toast } from "react-toastify";
import { createCameraApi } from "src/game/api/camera";
import { createFxApi } from "src/game/api/fx";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { getFleetTilePosition } from "src/util/unit";

export const renderBattle = (scene: Scene) => {
  const gameWorld = namespaceWorld(world, "game");
  const { BattleResult } = components;

  /* Can we pass in the custom scene instead of building it again here? */
  const fx = createFxApi(scene);
  const camera = createCameraApi(scene);

  const attackAnimation = async (entity: Entity, attacker: Entity, defender: Entity, attackerWinner?: boolean) => {
    console.log("attacking", Date.now());
    components.FleetMovement.pauseUpdates(attacker);

    const isPirate = components.PirateAsteroid.has(defender);
    if (isPirate) components.PirateAsteroid.pauseUpdates(defender);

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
        battleNotification({ entity });
      }
    }, duration * 0.9);

    setTimeout(() => {
      components.BattleRender.clear();

      console.log("attacking complete, resuming components", Date.now());
      components.FleetMovement.resumeUpdates(attacker);
      if (isFleet) components.FleetMovement.resumeUpdates(defender);
      if (isPirate) components.PirateAsteroid.resumeUpdates(defender);
    }, duration * 1.2);
  };

  function battleNotification(update: { entity: Entity }) {
    const now = components.Time.get()?.value ?? 0n;
    if (now === 0n) return;

    const battle = components.Battle.get(update.entity);

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const playerEntity = components.Account.get()?.value;
    const attackerRock = components.OwnedBy.get(battle.attacker)?.value as Entity | undefined;
    const attackerRockOwner = components.OwnedBy.get(attackerRock)?.value;
    const defenderIsFleet = components.IsFleet.get(battle.defender)?.value;
    const defenderRock = defenderIsFleet
      ? (components.OwnedBy.get(battle.defender)?.value as Entity | undefined)
      : battle.defender;
    const defenderRockOwner = components.OwnedBy.get(defenderRock)?.value;

    const winner = battle.winner;
    if (defenderRock && attackerRockOwner === playerEntity) {
      const defenderName = defenderIsFleet ? entityToFleetName(battle.defender) : entityToRockName(defenderRock);
      battle.attacker === winner
        ? toast.success(`Victory! You attacked ${defenderName} and won! View details in the battle report.`)
        : toast.error(`Defeat! You attacked ${defenderName} and lost! View details in the battle report.`);
    } else if (attackerRock && defenderRockOwner === playerEntity) {
      battle.defender === winner
        ? toast.success(
            `Victory! You defended against ${entityToFleetName(
              battle.attacker
            )} and won! View details in the battle report.`
          )
        : toast.error(
            `Defeat! You defended against ${entityToFleetName(
              battle.attacker
            )} and lost! View details in the battle report .`
          );
    }
  }

  defineComponentSystem(gameWorld, BattleResult, (update) => {
    const now = components.Time.get()?.value ?? 0n;

    const battle = components.Battle.get(update.entity);

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    const destination = components.Position.get(battle.rock as Entity);
    if (!destination) return;

    attackAnimation(update.entity, battle.attacker, battle.defender, battle.attacker === battle.winner);
  });
};
