import { Entity } from "@latticexyz/recs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useRockDefense } from "src/hooks/useRockDefense";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";

export const DefenseLabel = ({ player }: { player?: Entity }) => {
  const name = "Defense";
  const resourceId = EntityType.Defense;

  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  player = player ?? playerEntity;
  const rock = components.SelectedRock.use()?.value;
  const defense = useRockDefense(rock as Entity);
  if (!player || !rock) return null;
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <ResourceIconTooltip
      short={true}
      name={name}
      spaceRock={rock}
      amount={defense.points}
      resource={resourceId}
      image={resourceIcon ?? ""}
      fontSize={"sm"}
      fractionDigits={2}
    />
  );
};
