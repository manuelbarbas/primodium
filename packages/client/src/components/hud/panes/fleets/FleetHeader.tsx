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
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <Badge className="w-full uppercase font-bold text-sm items-center flex flex-col h-fit">{props.title}</Badge>
      <div className="grid grid-cols-6 gap-1">
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.attack, { short: true })}</p>
          <p className="scale-95 opacity-70"> ATK</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.defense, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEF</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.decryption, { short: true })}</p>
          <p className="scale-95 opacity-70"> DEC</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatResourceCount(EntityType.Iron, props.cargo)}</p>
          <p className="scale-95 opacity-70"> CRG</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.speed, { short: true })}</p>
          <p className="scale-95 opacity-70"> SPD</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="text-secondary">{formatNumber(props.hp, { short: true })}</p>
          <p className="scale-95 opacity-70"> HP</p>
        </Badge>
      </div>
    </div>
  );
};

export const FleetEntityHeader = ({ entity }: { entity: Entity }) => {
  const stats = getFleetStats(entity);
  return <FleetHeader {...stats} />;
};
