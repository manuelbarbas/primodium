import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Badge } from "src/components/core/Badge";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useRockDefense } from "src/hooks/useRockDefense";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";

export const DefenseLabel = ({ player }: { player?: Entity }) => {
  const name = "Defense";
  const resourceId = EntityType.Defense;
  player = player ?? components.Account.use()?.value ?? singletonEntity;
  const rock = components.ActiveRock.use()?.value;
  const defense = useRockDefense(rock as Entity);
  if (!player || !rock) return null;
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge>
      <ResourceIconTooltip
        short={true}
        name={name}
        spaceRock={rock}
        amount={defense.points}
        resource={resourceId}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
        fractionDigits={2}
      />
    </Badge>
  );
};
