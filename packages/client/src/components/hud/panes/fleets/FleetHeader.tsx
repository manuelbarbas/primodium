import { Badge } from "src/components/core/Badge";
import { EntityType } from "src/util/constants";
import { formatResourceCount } from "src/util/number";

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
          <p className="scale-95 opacity-50">{props.attack.toString()} ATK</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{props.defense.toString()} DEF</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{formatResourceCount(EntityType.Iron, props.cargo).toString()} CRG</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{props.decryption.toString()} DEC</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{props.speed.toString()} SPD</p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">{props.hp.toString()} HP</p>
        </Badge>
      </div>
    </div>
  );
};
