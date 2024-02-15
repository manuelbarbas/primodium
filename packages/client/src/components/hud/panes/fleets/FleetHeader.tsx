import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
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
      <Badge className="w-full uppercase font-bold text-sm items-center flex flex-col h-fit">{props.title}</Badge>
      <div className="grid grid-cols-6 gap-1">
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.attack, { short: true })}</p>
          <p className="scale-95 opacity-70"> ATK</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.defense, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEF</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.decryption, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEC</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.cargo, { short: true })}</p>
          <p className="scale-95 opacity-70"> CRG</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.speed, { short: true })}</p>
          <p className="scale-95 opacity-70"> SPD</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.hp, { short: true })}</p>
          <p className="scale-95 opacity-70"> HP</p>
        </Badge>
      </div>
    </div>
  );
};

export const FleetEntityHeader = ({ entity, className }: { entity: Entity; className?: string }) => {
  const stats = getFleetStats(entity);
  return <FleetHeader className={className} {...stats} />;
};
