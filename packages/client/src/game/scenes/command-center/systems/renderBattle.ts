import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { PrimodiumScene } from "@/game/api/scene";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { addCoords } from "engine/lib/util/coords";
import { Mode } from "@/util/constants";
import { battleNotification } from "@/network/systems/setupBattleNotifications";
// import { entityToFleetName, entityToRockName } from "src/util/name";

const OFFSET = 1000;
export const renderBattle = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { BattleResult } = components;

  const attackAnimation = async (entity: Entity, attacker: Entity, defender: Entity, attackerWinner?: boolean) => {
    const battleResult = components.BattleResult.get(entity);
    const defenderIsFleet = !!components.IsFleet.get(defender)?.value;

    const attackerObj = scene.objects.fleet.get(attacker);
    const defenderObj = defenderIsFleet ? scene.objects.fleet.get(defender) : scene.objects.asteroid.get(defender);

    if (!attackerObj || !defenderObj) return;

    const attackerPosition = attackerObj.getPixelCoord();
    const defenderPosition = defenderObj.getPixelCoord();

    const defenderAnimationStart = 2000;
    const defenderAllies = battleResult?.targetAllies
      .map((ally, i) => {
        const defenderFleet = scene.objects.fleet.get(ally as Entity);

        if (!defenderFleet) return null;

        return {
          at: defenderAnimationStart + OFFSET * i,
          run: () => {
            defenderFleet.fireAt(attackerPosition);
          },
        };
      })
      .filter((item) => item !== null) as Phaser.Types.Time.TimelineEventConfig[];

    const battleRender = scene.phaserScene.add
      .timeline([
        {
          at: 0,
          run: () => {
            components.BattleTarget.remove();
            components.FleetMovement.pauseUpdates(attacker);
            components.BattleTarget.blockUpdates(singletonEntity);
            components.SelectedMode.blockUpdates(singletonEntity);
            if (defenderIsFleet) components.FleetMovement.pauseUpdates(defender);
            if (!defenderIsFleet) (defenderObj as BaseAsteroid).getFleetsContainer().pauseRotation();
            attackerObj.fireAt(defenderPosition);
          },
        },
        ...(defenderAllies ?? []),
        {
          at: defenderAnimationStart + OFFSET * defenderAllies.length + (defenderAllies.length ? OFFSET : 0),
          run: () => {
            defenderObj.fireAt(attackerPosition);
          },
        },
        {
          at: defenderAnimationStart + OFFSET * defenderAllies.length + OFFSET + 500,
          run: () => {
            const offset = { x: 0, y: -20 };
            scene.fx.emitFloatingText(addCoords(offset, attackerWinner ? defenderPosition : attackerPosition), "LOST", {
              color: 0xff0000,
            });
            scene.fx.emitFloatingText(addCoords(offset, attackerWinner ? attackerPosition : defenderPosition), "WON");
            if (!defenderIsFleet) (defenderObj as BaseAsteroid).getFleetsContainer().resumeRotation();
          },
        },
        {
          at: defenderAnimationStart + OFFSET * defenderAllies.length + OFFSET + 1000,
          run: () => {
            battleRender.destroy();
            components.FleetMovement.resumeUpdates(attacker);
            components.BattleTarget.unblockUpdates(singletonEntity);
            components.SelectedMode.unblockUpdates(singletonEntity);
            if (defenderIsFleet) components.FleetMovement.resumeUpdates(defender);

            battleNotification(entity);
          },
        },
      ])
      .play();
  };

  defineComponentSystem(systemsWorld, BattleResult, (update) => {
    const now = components.Time.get()?.value ?? 0n;

    const battle = components.Battle.get(update.entity);

    if (!battle) return;

    if (battle.timestamp + 30n < now) return;

    //only render for selected rock in command view
    if (
      components.SelectedMode.get()?.value !== Mode.CommandCenter ||
      components.SelectedRock.get()?.value !== battle.rock
    )
      return;

    attackAnimation(update.entity, battle.attacker, battle.defender, battle.attacker === battle.winner);
  });
};
