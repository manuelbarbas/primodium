import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "../../core/Button";
import { IconLabel } from "../../core/IconLabel";
import { Modal } from "../../core/Modal";
import { Marker } from "../../shared/Marker";
import { Fleets } from "../panes/fleets/Fleets";

export const _FleetTarget: React.FC<{ fleet: Entity; x: number; y: number }> = ({ fleet, x, y }) => {
  const location = components.FleetMovement.use(fleet)?.destination;
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const selectingAttackDestination = !!components.Attack.use()?.originFleet;
  const selectingDestination = !!components.Send.use()?.originFleet || selectingAttackDestination;
  const primodium = usePrimodium();
  const {
    hooks: { useCoordToScreenCoord },
  } = primodium.api(Scenes.Starmap);

  // this is dumb
  const coord = useMemo(() => ({ x, y }), [x, y]);
  const { screenCoord, isBounded } = useCoordToScreenCoord(coord, true);
  if (!mapOpen || !location) return <></>;

  if (isBounded)
    return <Marker coord={{ x: screenCoord.x, y: screenCoord.y }} imageUri="/img/icons/weaponryicon.png" />;

  return (
    <div
      style={{ left: `calc(${screenCoord.x}px)`, top: `calc(${screenCoord.y}px)` }}
      className={`text-error absolute -translate-y-1/2 -translate-x-1/2`}
    >
      <div className="w-14 h-14 border-2 border-error flex items-center justify-center bg-transparent">
        <div className="absolute top-0 right-0 translate-x-full w-36">
          <Button
            disabled={selectingDestination}
            onClick={() => components.Attack.setOrigin(fleet, { x, y })}
            className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
          >
            Attack
          </Button>
        </div>
        <div className="absolute bottom-0 right-0 translate-x-full w-36">
          <Button
            disabled={selectingDestination}
            onClick={() => components.Send.setOrigin(fleet, { x, y })}
            className="btn-ghost btn-xs text-xs text-accent bg-rose-900 border border-l-0 border-secondary/50"
          >
            Move Fleet
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 -translate-x-full">
          <Button
            className="btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 pl-2 border-secondary/50 w-28 transition-[width] duration-200"
            onClick={() => {
              components.Send.reset();
              components.Attack.reset();
              !selectingDestination && components.SelectedFleet.remove();
            }}
          >
            <IconLabel
              imageUri="/img/icons/returnicon.png"
              className={``}
              text={selectingDestination ? "CANCEL" : "CLOSE"}
            />
          </Button>
        </div>
        <div className="absolute top-0 left-0 -translate-x-full">
          <Modal>
            <Modal.Button
              disabled={selectingDestination}
              className="btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 pl-2 border-secondary/50 w-28 transition-[width] duration-200"
            >
              <IconLabel imageUri="/img/icons/returnicon.png" text={"MANAGE"} />
            </Modal.Button>
            <Modal.Content className="w-3/4 h-4/5">
              <Fleets initialState="manageFleet" fleetEntity={fleet} />
            </Modal.Content>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export const FleetTarget = () => {
  const activeFleet = components.SelectedFleet.use();
  if (!activeFleet) return <></>;
  return <_FleetTarget {...activeFleet} />;
};
