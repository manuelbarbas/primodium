import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { useMud } from "@/hooks";
import { useColonySlots } from "@/hooks/useColonySlots";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { getAsteroidInfo } from "@/util/asteroid";
import { EntityType } from "@/util/constants";
import { EntityToUnitImage } from "@/util/mappings";
import { entityToFleetName, entityToRockName } from "@/util/name";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";

export const OwnedColonyShip: React.FC<{ parentEntity: Entity; onClick?: () => void }> = ({
  parentEntity,
  onClick,
}) => {
  const isFleet = components.IsFleet.has(parentEntity);
  const name = isFleet ? entityToFleetName(parentEntity) : entityToRockName(parentEntity);

  const image = isFleet ? InterfaceIcons.Outgoing : InterfaceIcons.Asteroid;
  const Selected = isFleet ? components.SelectedFleet : components.SelectedRock;

  const selected = Selected.use()?.value === parentEntity;

  return (
    <Button size="content" selected={selected} onClick={onClick} className="!gap-1">
      <div className="grid grid-cols-5 gap-1 justify-around w-full items-center min-h-16">
        <img src={EntityToUnitImage[EntityType.ColonyShip]} className="w-10" />
        <img src={image} className="w-10" />
        <div className="flex flex-col col-span-3 text-wrap">
          <p className="text-xs opacity-70">{isFleet ? "Deployed to" : "Idling on"}</p>
          <p className="">{name}</p>
        </div>
      </div>
    </Button>
  );
};

export const OwnedColonyShips: React.FC<{ className?: string }> = ({ className }) => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  const primodium = usePrimodium();

  const colonyShips = useColonySlots(playerEntity).occupiedSlots.filter((slot) => slot.type === "ship");

  const handleSelectRock = (entity: Entity) => {
    const { position } = getAsteroidInfo(primodium, entity);
    const { pan, zoomTo } = primodium.api("STARMAP").camera;

    components.SelectedRock.set({ value: entity });

    pan({
      x: position.x,
      y: position.y,
    });

    zoomTo(2);
  };

  const handleSelectFleet = (entity: Entity) => {
    const { pan, zoomTo } = primodium.api("STARMAP").camera;
    const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    const time = components.Time.get()?.value ?? 0n;

    if (arrivalTime < time) components.SelectedFleet.set({ value: entity });

    const objects = primodium.api("STARMAP").objects;
    const fleet = objects.getFleet(entity);

    if (!fleet) return;
    const position = fleet.getTileCoord();

    pan({
      x: position.x,
      y: position.y,
    });

    zoomTo(2);
  };
  return (
    <SecondaryCard className={className}>
      {colonyShips.length === 0 && (
        <p className="w-full h-full text-xs grid place-items-center opacity-50 uppercase">
          you control no colony ships
        </p>
      )}
      <div className="grid grid-cols-2 gap-1 mb-4 auto-rows-max overflow-auto scrollbar">
        {colonyShips.map((shipData, i) => (
          <OwnedColonyShip
            key={`colonyship-${shipData.parentEntity}-${i}`}
            parentEntity={shipData.parentEntity}
            onClick={() =>
              components.IsFleet.has(shipData.parentEntity)
                ? handleSelectFleet(shipData.parentEntity)
                : handleSelectRock(shipData.parentEntity)
            }
          />
        ))}
      </div>
      {colonyShips.length > 0 && (
        <div className="absolute bottom-0 right-1 opacity-70">
          {colonyShips.length} Colony Ship{colonyShips.length > 1 ? "s" : ""}
        </div>
      )}
    </SecondaryCard>
  );
};
