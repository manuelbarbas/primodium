import { EFleetStance } from "contracts/config/enums";
import { useCallback, useMemo } from "react";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { formatTime } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { IconLabel } from "@/components/core/IconLabel";
import { Navigator } from "@/components/core/Navigator";
import { Tabs } from "@/components/core/Tabs";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";
import { useGame } from "@/hooks/useGame";
import { alert } from "@/util/alert";
import { cn } from "@/util/client";

export const FleetManageButtons = ({ fleet }: { fleet: Entity }) => {
  const { tables } = useCore();
  const game = useGame();
  const target = tables.FleetMovement.use(fleet)?.destination;
  const fleetStance = tables.FleetStance.use(fleet)?.stance;
  const { clearFleetStance, setFleetStance, landFleet, clearFleet, abandonFleet } = useContractCalls();

  const setStance = useCallback(
    (stance: EFleetStance) => {
      if (stance === fleetStance) {
        clearFleetStance(fleet);
        return;
      }

      setFleetStance(fleet, stance, target as Entity);
    },
    [fleetStance, fleet, target],
  );

  return (
    <>
      <TransactionQueueMask queueItemId={"FleetStance" as Entity}>
        <Button
          size="content"
          variant={fleetStance === EFleetStance.Defend ? "error" : "neutral"}
          className="w-full"
          onClick={() => setStance(EFleetStance.Defend)}
        >
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Defense} />
            <div className="flex flex-col items-start">
              <p>{fleetStance === EFleetStance.Defend ? "CLEAR DEFEND STANCE" : "DEFEND ASTEROID"}</p>
              <p className="block text-xs opacity-75 text-wrap text-left">Join the battle during an attack</p>
            </div>
          </div>
        </Button>
      </TransactionQueueMask>
      <TransactionQueueMask queueItemId={"FleetStance" as Entity}>
        <Button
          size="content"
          variant={fleetStance === EFleetStance.Block ? "error" : "neutral"}
          className="w-full"
          onClick={() => setStance(EFleetStance.Block)}
        >
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Block} />
            <div className="flex flex-col items-start">
              <p>{fleetStance === EFleetStance.Block ? "CLEAR BLOCKADE STANCE" : "BLOCKADE ASTEROID"}</p>
              <p className="block text-xs opacity-75 text-wrap text-left">Prevent fleets from leaving orbit</p>
            </div>
          </div>
        </Button>
      </TransactionQueueMask>
      <TransactionQueueMask queueItemId={"landFleet" as Entity}>
        <Button
          size="content"
          variant="neutral"
          className="w-full"
          onClick={() =>
            alert(
              "Are you sure you want to change fleet ownership? All resources and units will be transferred to the current asteroid!",
              () => landFleet(fleet, (target ?? defaultEntity) as Entity),
            )
          }
        >
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Housing} />
            <div className="flex flex-col items-start">
              <p>SET HOMEBASE</p>
              <p className="block text-xs opacity-75 w-64 text-wrap text-left">GIVE THIS ASTEROID FLEET CONTROL</p>
            </div>
          </div>
        </Button>
      </TransactionQueueMask>

      <div className="grid grid-cols-2 gap-2">
        <TransactionQueueMask queueItemId={"clear" as Entity}>
          <Button
            size="content"
            variant="neutral"
            className="w-full"
            onClick={() =>
              alert(
                "Are you sure you want to clear fleet? All resources and units will be lost forever!",
                () => clearFleet(fleet),
                game,
              )
            }
          >
            <div className="flex flex-start items-center px-1 gap-3">
              <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Trash} />
              <div className="flex flex-col items-start">
                <p>EMPTY</p>
                <p className="block text-xs opacity-75  text-wrap text-left">REMOVE ALL CARGO</p>
              </div>
            </div>
          </Button>
        </TransactionQueueMask>

        <TransactionQueueMask queueItemId={"disbandFleet" as Entity}>
          <Button
            size="content"
            variant="neutral"
            className="w-full"
            onClick={() => alert("Are you sure you want to disband fleet?", () => abandonFleet(fleet), game)}
          >
            <div className="flex flex-start px-1 gap-3">
              <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Return} />
              <div className="flex flex-col items-start">
                <p>DISBAND</p>
                <p className="block text-xs opacity-75  text-wrap text-left">DELETE FROM EMPIRE</p>
              </div>
            </div>
          </Button>
        </TransactionQueueMask>
      </div>
    </>
  );
};

export const AttackButton = ({ target }: { target: Entity }) => {
  const { tables } = useCore();
  const gracePeriod = tables.GracePeriod.use(target)?.value ?? 0n;
  const now = tables.Time.use()?.value ?? 0n;
  const inGrace = now < gracePeriod;
  return (
    <>
      <Navigator.NavButton
        to="attack"
        className={cn("py-3 grow flex-col items-center min-w-72", !inGrace && "heropattern-topography-slate-100/10")}
        variant="error"
        size="content"
        disabled={inGrace}
      >
        {!inGrace && <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />}
        <div className="flex flex-start px-1 gap-3">
          <IconLabel
            className="text-lg drop-shadow-hard text-white"
            imageUri={InterfaceIcons.Attack2}
            text={inGrace ? "IN GRACE PERIOD" : "ATTACK"}
          />
        </div>
        <div className="absolute bottom-0 right-0 p-1 bg-error/50 text-xs rounded-bl-xl rounded-tl-xl"></div>
      </Navigator.NavButton>
      {inGrace && (
        <div className="opacity-75 mx-auto">
          <IconLabel className="text-xs" imageUri={InterfaceIcons.Grace} text={formatTime(gracePeriod - now)} />
        </div>
      )}
    </>
  );
};

export const InitialScreen = ({ target }: { target: Entity }) => {
  const { tables } = useCore();
  const playerEntity = tables.Account.use()?.value;
  const isFleet = !!tables.IsFleet.use(target)?.value;

  const isOwner = useMemo(() => {
    if (!playerEntity) return false;

    if (isFleet)
      return tables.OwnedBy.get(tables.OwnedBy.get(target)?.value as Entity | undefined)?.value === playerEntity;

    return tables.OwnedBy.get(target)?.value === playerEntity;
  }, [playerEntity, target, isFleet]);

  return (
    <Navigator.Screen title="initial" className="gap-2 flex h-full w-full">
      {/* Attack if not owned */}
      {!isOwner && <AttackButton target={target} />}
      <Tabs.Button index={1} variant="neutral" size="content" onClick={() => tables.BattleTarget.remove()}>
        <div className="flex flex-start px-1 gap-3 w-full">
          <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Transfer} />
          <div className="flex flex-col items-start">
            <p>TRANSFER INVENTORY</p>
            <p className="block text-xs opacity-75 text-wrap">TRADE UNITS AND RESOURCES</p>
          </div>
        </div>
      </Tabs.Button>
      {/* Manage buttons if owned and is a fleet */}
      {isOwner && isFleet && <FleetManageButtons fleet={target} />}
    </Navigator.Screen>
  );
};
