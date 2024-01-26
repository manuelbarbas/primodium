import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { Badge } from "src/components/core/Badge";
import { Modal } from "src/components/core/Modal";
import { AccountDisplay } from "src/components/shared/AccountDisplay";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { UnitEntityLookup, UnitStorages } from "src/util/constants";
import { getSpaceRockName } from "src/util/spacerock";
import { getUnitStats } from "src/util/trainUnits";
import { Hex } from "viem";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p className="text-xs font-bold text-cyan-400">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const Fleet: React.FC<{
  fleetEntity: Entity;
  arrivalTime: bigint;
  origin: Entity;
  destination: Entity;
  dontShowButton?: boolean;
}> = ({ arrivalTime, fleetEntity, destination, origin }) => {
  const primodium = usePrimodium();
  const timeRemaining = arrivalTime - (components.Time.use()?.value ?? 0n);

  const owner = components.OwnedBy.use(destination)?.value as Entity | undefined;
  const name = getSpaceRockName(destination);

  const attack = useMemo(() => {
    return [...UnitStorages].reduce((acc, curr, index) => {
      const unitCount =
        components.UnitCount.getWithKeys({ entity: fleetEntity as Hex, unit: curr as Hex })?.value ?? 0n;
      if (unitCount === 0n) return acc;
      const entity = UnitEntityLookup[(index + 1) as EUnit];
      const attack = getUnitStats(entity, origin).ATK;
      return acc + attack * unitCount;
    }, 0n);
  }, [fleetEntity, origin]);

  const onCoordinateClick = async () => {
    const coord = components.Position.get(destination, {
      x: 0,
      y: 0,
      parent: "0" as Entity,
    });

    if (!coord) return;
    const mapOpen = components.MapOpen.get(undefined, {
      value: false,
    }).value;

    if (!mapOpen) {
      const { transitionToScene } = primodium.api().scene;

      await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
    }

    const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;

    components.MapOpen.set({ value: true });
    components.SelectedBuilding.remove();
    components.SelectedRock.set({ value: destination });

    pan(coord);

    zoomTo(2);
  };

  return (
    <div className="flex items-center justify-between w-full border rounded-box border-slate-700 bg-slate-800 pr-1">
      <div className="flex gap-1 justify-between items-center h-full w-full">
        <div className="flex gap-1 items-center h-full">
          <Badge className="text-xs flex flex-col items-center h-fit bg-transparent border-none">
            <p className="text-lg leading-5">{attack.toLocaleString()}</p> ATK
          </Badge>

          <p className="animate-pulse opacity-80">{timeRemaining > 0 ? "IN TRANSIT" : "ORBITING"}</p>
        </div>
        <div className="flex gap-5 items-center">
          <Modal.CloseButton className="btn-sm" onClick={onCoordinateClick}>
            {owner ? <AccountDisplay player={owner} /> : <p className="text-xs">{name}</p>}
          </Modal.CloseButton>
          <div className="text-right">
            {
              timeRemaining > 0 ? (
                <LabeledValue label="ETA">
                  <div className="flex gap-1 text-xs">
                    <p>{timeRemaining.toLocaleString()}</p>
                    <span className="opacity-50">SEC</span>
                  </div>
                </LabeledValue>
              ) : null
              // !dontShowButton && <OrbitActionButton arrivalEntity={arrivalEntity} sendType={sendType} small={small} />
            }
          </div>
        </div>
      </div>
    </div>
  );
};
