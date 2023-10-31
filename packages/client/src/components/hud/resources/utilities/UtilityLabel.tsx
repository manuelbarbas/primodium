import { Entity } from "@latticexyz/recs";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { ResourceEnumLookup, ResourceImage } from "src/util/constants";
import { Hex } from "viem";

export const UtilityLabel = ({
  name,
  resourceId,
  multiplierId,
}: {
  name: string;
  resourceId: Entity;
  multiplierId?: Entity;
}) => {
  const playerEntity = useMud().network.playerEntity;
  const { resourceCount } = useFullResourceCount(resourceId, playerEntity);
  const multiplierAmount =
    components.ResourceCount.useWithKeys({
      entity: playerEntity as Hex,
      resource: multiplierId ? ResourceEnumLookup[multiplierId] : 0,
    })?.value ?? 0n;

  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <div className="flex flex-row gap-1 mx-1 group pointer-events-auto">
      <ResourceIconTooltip
        short={false}
        name={name}
        playerEntity={playerEntity}
        amount={resourceCount * (multiplierAmount || 1n)}
        resource={resourceId}
        scale={1n}
        image={resourceIcon ?? ""}
        validate={false}
        fontSize={"sm"}
      />
      {multiplierAmount !== 0n && (
        <p className="opacity-50 text-[0] group-hover:text-xs transition-all">X{multiplierAmount.toLocaleString()}</p>
      )}
    </div>
  );
};
