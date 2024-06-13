import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Badge } from "@/components/core/Badge";
import { IconLabel } from "@/components/core/IconLabel";
import { useCore, useAsteroidStrength } from "@primodiumxyz/core/react";
import { EntityType, formatResourceCount } from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";

export const StrengthLabel = ({ player }: { player?: Entity }) => {
  const { tables } = useCore();
  player = player ?? tables.Account.use()?.value ?? defaultEntity;
  const rock = tables.ActiveRock.use()?.value;
  const { strength, maxStrength } = useAsteroidStrength(rock as Entity);

  if (!player || !rock) return null;

  return (
    <Badge className="w-full flex justify-start">
      <IconLabel
        imageUri={EntityToResourceImage[EntityType.HP]}
        text={formatResourceCount(EntityType.HP, strength, { short: true })}
        className="mr-1"
      />
      <b className={`text-accent text-xs opacity-50`}>
        /{formatResourceCount(EntityType.HP, maxStrength, { short: true })}
      </b>
    </Badge>
  );
};
