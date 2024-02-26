import { Scenes } from "@game/constants";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Widget } from "src/components/core/Widget";
import { useMud } from "src/hooks";
import { useFleetStats } from "src/hooks/useFleetCount";
import { usePlayerOwner } from "src/hooks/usePlayerOwner";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { formatNumber, formatResourceCount, formatTime } from "src/util/number";
import { getFleetTilePosition } from "src/util/unit";

export const LabeledValue: React.FC<{
  label: string;
  children?: React.ReactNode;
}> = ({ children = null, label }) => {
  return (
    <div className="flex flex-col gap-1 w-fit">
      <p className="text-xs font-bold text-accent">{label}</p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
};

export const OwnedFleet: React.FC<{ fleet: Entity; onClick?: () => void }> = ({ fleet, onClick }) => {
  const description = entityToFleetName(fleet);
  const selected = components.SelectedFleet.use()?.value === fleet;
  const fleetStats = useFleetStats(fleet);
  const movement = components.FleetMovement.use(fleet);
  const time = components.Time.use()?.value ?? 0n;
  const stance = components.FleetStance.use(fleet);

  const owner = usePlayerOwner(fleet);
  const playerEntity = useMud().playerAccount.entity;

  const fleetStateText = useMemo(() => {
    const arrivalTime = movement?.arrivalTime ?? 0n;
    const inTransit = arrivalTime > (time ?? 0n);
    // const inTransit = true;
    if (inTransit) return `ETA ${formatTime(arrivalTime - time)} to`;
    if (stance && stance?.stance === EFleetStance.Follow)
      return `Following ${entityToFleetName(stance.target as Entity)}`;
    if (stance?.stance === EFleetStance.Block) return "Blocking";
    if (stance?.stance === EFleetStance.Defend) return "Defending";
    return "Orbiting";
  }, [movement?.arrivalTime, time, stance]);

  return (
    <Button
      className={`row-span-1 flex flex-col p-2 gap-1 items-center text-xs bg-base-100 flex-nowrap border-secondary ${
        selected ? "drop-shadow-hard ring-2 ring-warning" : ""
      }`}
      onClick={async () => {
        onClick && onClick();
      }}
    >
      {owner !== playerEntity && <div className="absolute top-0 right-0 px-1 bg-error text-[.6rem]">enemy</div>}
      <img src="img/icons/outgoingicon.png" className=" w-12 h-12 p-2 bg-neutral border border-secondary" />
      <div className="flex flex-col h-fit text-xs">
        <div className="flex gap-1 items-center justify-center"></div>
        <p className={`"font-bold -mt-3 ${playerEntity !== owner ? "bg-error" : "bg-secondary"} px-1`}>{description}</p>
      </div>
      <hr className="w-full border border-secondary/25" />
      <p className="flex flex-col justify-center font-thin">
        {fleetStateText}
        {!!movement && <p className="text-accent">{entityToRockName(movement.destination as Entity)}</p>}
      </p>
      <hr className="w-full border border-secondary/25" />
      <div className="grid grid-cols-2 gap-x-3 p-1">
        <div className="grid grid-cols-2 gap-1">
          {formatResourceCount(EntityType.Iron, fleetStats.attack, { short: true })}
          <p className="text-accent">ATK</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {formatResourceCount(EntityType.Iron, fleetStats.defense, { short: true })}
          <p className="text-accent">DEF</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {formatResourceCount(EntityType.Iron, fleetStats.cargo, { short: true })}
          <p className="text-accent">CRG</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {formatResourceCount(EntityType.Iron, fleetStats.hp, { short: true })}
          <p className="text-accent">HP</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <p className="">{formatNumber(fleetStats.speed, { short: true })}</p>
          <p className="text-accent">SPD</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {formatResourceCount(EntityType.Iron, fleetStats.decryption, { short: true })}
          <p className="text-accent">DEC</p>
        </div>
      </div>
    </Button>
  );
};

const _OwnedFleets: React.FC = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();
  const getScene = primodium.api(Scenes.Starmap).scene.getScene;

  const query = [Has(components.IsFleet)];
  const fleets = useEntityQuery(query).filter((entity) => {
    const rock = components.OwnedBy.get(entity)?.value as Entity;
    if (!rock) return false;
    const player = components.OwnedBy.get(rock)?.value;
    return player == playerEntity;
  });

  return (
    <div className="p-2 max-h-96 overflow-y-auto scrollbar w-fit">
      {fleets.length === 0 && (
        <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
          <p className="opacity-50 uppercase">you control no fleets</p>
        </SecondaryCard>
      )}
      <div className="grid grid-cols-2 gap-1">
        {fleets.map((entity) => {
          return (
            <OwnedFleet
              key={entity}
              fleet={entity}
              onClick={async () => {
                const scene = getScene(Scenes.Starmap);
                if (!scene) return;
                const mapOpen = components.MapOpen.get(undefined, {
                  value: false,
                }).value;

                if (!mapOpen) {
                  const { transitionToScene } = primodium.api().scene;

                  await transitionToScene(Scenes.Asteroid, Scenes.Starmap);
                  components.MapOpen.set({ value: true });
                }

                const { pan, zoomTo } = primodium.api(Scenes.Starmap).camera;
                const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
                const time = components.Time.get()?.value ?? 0n;

                if (arrivalTime < time) components.SelectedFleet.set({ value: entity });
                const position = getFleetTilePosition(scene, entity);

                pan({
                  x: position.x,
                  y: position.y,
                });

                zoomTo(2);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const OwnedFleets = () => {
  const { components } = useMud();
  const mapOpen = components.MapOpen.use()?.value;

  return (
    <Widget
      id="owned_fleets"
      title="Owned Fleets"
      icon="img/icons/outgoingicon.png"
      defaultLocked
      defaultVisible
      lockable
      draggable
      persist
      scene={Scenes.Starmap}
      active={!!mapOpen}
      defaultCoord={{ x: 0, y: 0 }}
    >
      <_OwnedFleets />
    </Widget>
  );
};
