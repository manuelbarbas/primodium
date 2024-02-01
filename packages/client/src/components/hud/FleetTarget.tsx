import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Button } from "../core/Button";
import { IconLabel } from "../core/IconLabel";
import { Marker } from "../shared/Marker";

export const _FleetTarget: React.FC<{ fleet: Entity; x: number; y: number }> = ({ fleet, x, y }) => {
  const location = components.FleetMovement.use(fleet)?.destination;
  const mapOpen = components.MapOpen.use()?.value ?? false;
  const selectingDestination = !!components.Send.use()?.originFleet;
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
      <div className="w-10 h-10 border-2 border-error flex items-center justify-center bg-transparent">
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
            className={`btn-ghost btn-xs text-xs text-accent bg-neutral border border-r-0 pl-2 border-secondary/50 ${
              selectingDestination ? "w-32" : "w-28"
            } transition-[width] duration-200`}
            onClick={() => {
              components.Send.clear();
              !selectingDestination && components.SelectedFleet.remove();
            }}
          >
            <IconLabel
              imageUri="/img/icons/returnicon.png"
              className={``}
              text={selectingDestination ? "CANCEL MOVE" : "CLOSE"}
            />
          </Button>
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
