import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useRockDefense } from "src/hooks/useRockDefense";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { Hex } from "viem";

export const DefenseLabel = ({ spaceRock }: { spaceRock?: Entity }) => {
  const player = useMud().network.playerEntity;
  const homeRock = components.Home.use(player)?.asteroid as Entity | undefined;
  const rock = spaceRock ?? homeRock;
  if (!rock) throw new Error("No rock found");

  const name = "Defense";
  const resourceId = EntityType.Defense;
  const defense = useRockDefense(rock);
  const resourceIcon = ResourceImage.get(resourceId);
  const multiplierAmount =
    components.ResourceCount.useWithKeys({ entity: rock as Hex, resource: EResource.M_DefenseMultiplier })?.value ?? 0n;

  return (
    <div className="gap-1 mx-1 group pointer-events-auto">
      <ResourceIconTooltip
        short={false}
        name={name}
        spaceRock={rock}
        amount={defense.points}
        resource={resourceId}
        image={resourceIcon ?? ""}
        fontSize={"sm"}
        fractionDigits={1}
      />
      {multiplierAmount !== 0n && (
        <p className="opacity-50 text-[0] group-hover:text-xs transition-all">{1 + Number(multiplierAmount) / 100}x</p>
      )}
    </div>
  );
};
