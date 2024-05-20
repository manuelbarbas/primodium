import { components } from "@/network/components";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "@/network/world";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { toast } from "react-toastify";
import { Mode } from "@/util/constants";

export function battleNotification(entity: Entity) {
  const now = components.Time.get()?.value ?? 0n;
  if (now === 0n) return;

  const battle = components.Battle.get(entity);

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

export const setupBattleNotifications = async () => {
  const systemsWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemsWorld, components.BattleResult, ({ entity }) => {
    const battle = components.Battle.get(entity);

    //let the animation trigger the notifcation otheriwse it comes early and is a total buzzkill
    if (
      components.SelectedMode.get()?.value === Mode.CommandCenter &&
      components.SelectedRock.get()?.value === battle?.rock
    )
      return;

    battleNotification(entity);
  });
};
