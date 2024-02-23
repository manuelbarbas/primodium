import { Entity } from "@latticexyz/recs";
import { IconLabel } from "src/components/core/IconLabel";
import { EntityType } from "src/util/constants";
import { formatNumber, formatResourceCount } from "src/util/number";
import { getFleetStats } from "src/util/unit";

export const FleetHeader = (props: {
  title: string;
  attack: bigint;
  cargo: bigint;
  decryption: bigint;
  defense: bigint;
  speed: bigint;
  hp: bigint;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${props.className}`}>
      <div className="flex justify-center uppercase font-bold">
        <IconLabel imageUri={"img/icons/outgoingicon.png"} className="" text={`${props.title}`} />
      </div>

      <div className="flex justify-center gap-1">
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatResourceCount(EntityType.Iron, props.attack, { short: true })}</p>
          <p className="scale-95 opacity-70"> ATK</p>
        </div>
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatResourceCount(EntityType.Iron, props.defense, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEF</p>
        </div>
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatResourceCount(EntityType.Iron, props.decryption, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEC</p>
        </div>
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatResourceCount(EntityType.Iron, props.cargo, { short: true })}</p>
          <p className="scale-95 opacity-70"> CRG</p>
        </div>
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatNumber(props.speed, { short: true })}</p>
          <p className="scale-95 opacity-70"> SPD</p>
        </div>
        <div className="flex gap-1 p-1 bg-primary uppercase font-bold text-xs items-center">
          <p>{formatResourceCount(EntityType.Iron, props.hp, { short: true })}</p>
          <p className="scale-95 opacity-70"> HP</p>
        </div>
      </div>
    </div>
  );
};

export const FleetEntityHeader = ({ entity, className }: { entity: Entity; className?: string }) => {
  const stats = getFleetStats(entity);
  return <FleetHeader className={className} {...stats} />;
};
