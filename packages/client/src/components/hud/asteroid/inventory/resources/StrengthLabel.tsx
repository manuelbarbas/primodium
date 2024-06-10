import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Badge } from "@/components/core/Badge";
import { IconLabel } from "@/components/core/IconLabel";
import { useAsteroidStrength } from "@/react/hooks/useAsteroidStrength";
import { components } from "@/network/components";
import { EntityType } from "@/util/constants";
import { formatResourceCount } from "@/util/number";

export const StrengthLabel = ({ player }: { player?: Entity }) => {
  player = player ?? components.Account.use()?.value ?? singletonEntity;
  const rock = components.ActiveRock.use()?.value;
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
