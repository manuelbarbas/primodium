import { Badge } from "@/components/core/Badge";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { useGame } from "@/hooks/useGame";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { entityToFleetName, entityToRockName, EntityType, formatTime } from "@primodiumxyz/core";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";

export const OwnedFleet: React.FC<{ fleet: Entity; onClick?: () => void }> = ({ fleet, onClick }) => {
  const { tables } = useCore();
  const fleetName = entityToFleetName(fleet);
  const selected = tables.SelectedFleet.use()?.value === fleet;
  const movement = tables.FleetMovement.use(fleet);
  const time = tables.Time.use()?.value ?? 0n;
  const stance = tables.FleetStance.use(fleet);

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
    <Button size="content" selected={selected} onClick={onClick} className="!gap-1 min-h-24">
      <p className="text-wrap">{fleetName}</p>
      <div className="flex justify-around w-full items-center">
        <img src={InterfaceIcons.Fleet} className="w-10 h-10" />
        <p className="flex flex-col text-xs">
          {fleetStateText}{" "}
          {!!movement && <span className="text-accent">{entityToRockName(movement.destination as Entity)}</span>}
        </p>
      </div>
    </Button>
  );
};

export const OwnedFleets: React.FC<{ className?: string }> = ({ className }) => {
  const { tables } = useCore();
  const {
    playerAccount: { entity: playerEntity },
  } = useAccountClient();
  const game = useGame();

  const fleets = useQuery({ with: [tables.IsFleet] }).filter((entity) => {
    const rock = tables.OwnedBy.get(entity)?.value as Entity;
    if (!rock) return false;
    const player = tables.OwnedBy.get(rock)?.value;
    return player == playerEntity;
  });

  const handleSelect = (entity: Entity) => {
    const { pan, zoomTo } = game.STARMAP.camera;
    const arrivalTime = tables.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    const time = tables.Time.get()?.value ?? 0n;

    if (arrivalTime < time) tables.SelectedFleet.set({ value: entity });

    const objects = game.STARMAP.objects;
    const fleet = objects.fleet.get(entity);
    let position = fleet?.getTileCoord();

    if (!position) {
      // the fleet might be around a non-spawned asteroid, so we need to check if it's registered
      const deferredRenderContainer = objects.deferredRenderContainer.getContainer(
        EntityType.Asteroid
      ) as DeferredAsteroidsRenderContainer;
      const asteroidPosition = deferredRenderContainer.getFleetCoord(entity);

      if (!asteroidPosition) return;
      position = asteroidPosition;
    }

    pan({
      x: position.x,
      y: position.y,
    });

    zoomTo(2);
  };

  return (
    <Card noDecor className={`relative ${className}`}>
      {fleets.length === 0 && (
        <p className="w-full h-full text-xs grid place-items-center opacity-50 uppercase">you control no fleets</p>
      )}
      <div className="grid grid-cols-2 gap-1 mb-4 h-full auto-rows-max overflow-auto hide-scrollbar">
        {fleets.map((entity) => {
          return <OwnedFleet key={entity} fleet={entity} onClick={() => handleSelect(entity)} />;
        })}
      </div>
      {fleets.length > 0 && (
        <Badge variant="info" className="absolute bottom-3 right-3 text-sm">
          {fleets.length} fleet{fleets.length > 1 ? "s" : ""}
        </Badge>
      )}
    </Card>
  );
};
