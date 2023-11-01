import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource } from "contracts/config/enums";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useRockDefense } from "src/hooks/useRockDefense";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { Hex } from "viem";

export const DefenseLabel = ({ player }: { player?: Entity }) => {
  const name = "Defense";
  const resourceId = EntityType.Defense;
  player = player ?? components.Account.use()?.value ?? singletonEntity;
  const rock = components.Home.get(player)?.asteroid;
  const defense = useRockDefense(rock as Entity, player);
  if (!player || !rock) return null;
  const resourceIcon = ResourceImage.get(resourceId);
  const multiplierAmount =
    components.ResourceCount.useWithKeys({ entity: player as Hex, resource: EResource.M_DefenseMultiplier })?.value ??
    0n;

  return (
    <div className="flex flex-row gap-1 mx-1 group pointer-events-auto items-center">
      <ResourceIconTooltip
        short={false}
        name={name}
        playerEntity={player}
        amount={defense}
        resource={resourceId}
        scale={1n}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
      {multiplierAmount !== 0n && (
        <p className="opacity-50 text-[0] group-hover:text-xs transition-all">{1 + Number(multiplierAmount) / 100}x</p>
      )}
    </div>
  );
};
