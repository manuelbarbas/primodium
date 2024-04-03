import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { useAsteroidStrength } from "src/hooks/useAsteroidStrength";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";

export const StrengthLabel = ({ player }: { player?: Entity }) => {
  const name = "Strength";
  const resourceId = EntityType.HP;
  player = player ?? components.Account.use()?.value ?? singletonEntity;
  const rock = components.ActiveRock.use()?.value;
  const { strength, maxStrength } = useAsteroidStrength(rock as Entity);
  if (!player || !rock) return null;
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="w-full flex justify-start">
      <IconLabel
        tooltipText={name}
        tooltipDirection="top"
        imageUri={resourceIcon ?? ""}
        text={formatResourceCount(resourceId, strength, { short: true })}
        className="mr-1"
      />
      <b className={`text-accent text-xs opacity-50`}>
        /{formatResourceCount(resourceId, maxStrength, { short: true })}
      </b>
    </Badge>
  );
};
