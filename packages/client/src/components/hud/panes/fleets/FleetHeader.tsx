import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { EntityType } from "src/util/constants";
import { getFleetStats } from "src/util/fleet";
import { formatNumber, formatResourceCount } from "src/util/number";

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
          <p className="scale-95 opacity-50">{formatNumber(props.attack)} ATK</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatNumber(props.defense)} DEF</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatResourceCount(EntityType.Iron, props.cargo).toString()} CRG</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatNumber(props.decryption)} DEC</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatNumber(props.speed)} SPD</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatNumber(props.hp)} HP</p>
        </Badge>
      </div>
    </div>
  );
};

export const FleetEntityHeader = ({ entity }: { entity: Entity }) => {
  const stats = getFleetStats(entity);
  return <FleetHeader {...stats} />;
};
