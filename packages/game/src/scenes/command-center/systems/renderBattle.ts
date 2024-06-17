import { addCoords } from "@primodiumxyz/engine/lib/util/coords";
import { Entity, namespaceWorld, defaultEntity } from "@primodiumxyz/reactive-tables";
import { Core, Mode } from "@primodiumxyz/core";

import { PrimodiumScene } from "@game/types";

const OFFSET = 1000;
export const renderBattle = (scene: PrimodiumScene, core: Core) => {
  const {
    tables,
    network: { world },
  } = core;
  const systemsWorld = namespaceWorld(world, "systems");

  const attackAnimation = async (entity: Entity, attacker: Entity, defender: Entity, attackerWinner?: boolean) => {
    const battleResult = tables.BattleResult.get(entity);
    const defenderIsFleet = !!tables.IsFleet.get(defender)?.value;
    const selectedRock = tables.SelectedRock.get()?.value;

    const attackerObj = scene.objects.fleet.get(attacker);
    const defenderObj = defenderIsFleet ? scene.objects.fleet.get(defender) : scene.objects.asteroid.get(defender);
    const rockObj = scene.objects.asteroid.get(selectedRock ?? defaultEntity);

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

    tables.BattleTarget.remove();
    tables.FleetMovement.pauseUpdates(attacker);
    tables.IsFleetEmpty.pauseUpdates(attacker);
    tables.BattleTarget.blockUpdates(defaultEntity);
    tables.SelectedMode.blockUpdates(defaultEntity);
    if (defenderIsFleet) {
      tables.FleetMovement.pauseUpdates(defender);
      tables.IsFleetEmpty.pauseUpdates(defender);
    }
    rockObj?.getFleetsContainer().pauseRotation();

    const battleRender = scene.phaserScene.add
      .timeline([
        {
          at: 0,
          run: () => {
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
            rockObj?.getFleetsContainer().resumeRotation();
          },
        },
        {
          at: defenderAnimationStart + OFFSET * defenderAllies.length + OFFSET + 1000,
          run: () => {
            battleRender.destroy();
            tables.FleetMovement.resumeUpdates(attacker);
            tables.IsFleetEmpty.resumeUpdates(attacker);
            tables.BattleTarget.unblockUpdates(defaultEntity);
            tables.SelectedMode.unblockUpdates(defaultEntity);
            if (defenderIsFleet) {
              tables.FleetMovement.resumeUpdates(defender);
              tables.IsFleetEmpty.resumeUpdates(defender);
            }

            //TODO: battle notification
            // battleNotification(entity);
          },
        },
      ])
      .play();
  };

  tables.BattleResult.watch({
    world: systemsWorld,
    onChange: ({ entity }) => {
      const now = tables.Time.get()?.value ?? 0n;

      const battle = tables.Battle.get(entity);

      if (!battle) return;

      if (battle.timestamp + 30n < now) return;

      //only render for selected rock in command view
      if (tables.SelectedMode.get()?.value !== Mode.CommandCenter || tables.SelectedRock.get()?.value !== battle.rock)
        return;

      attackAnimation(entity, battle.attacker, battle.defender, battle.attacker === battle.winner);
    },
  });
};
