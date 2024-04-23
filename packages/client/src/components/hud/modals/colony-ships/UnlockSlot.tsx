import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { useColonySlots } from "@/hooks/useColonySlots";
import { getEntityTypeName } from "@/util/common";
import { ResourceImage, ResourceType } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import React from "react";

export const UnlockSlot: React.FC<{ playerEntity: Entity; className?: string; index: number }> = ({
  playerEntity,
  className = "",
}) => {
  const colonySlotsData = useColonySlots(playerEntity);

  console.log(colonySlotsData);
  return (
    <SecondaryCard className={`h-full w-full flex flex-col gap-6 p-3 justify-center items-center ${className}`}>
      <p>Add Slot</p>
      {Object.entries(colonySlotsData.resourceCosts).map(([resource, { cost, paid }], i) => (
        <SlotResourceDisplay key={`slot-resource-${i}`} resource={resource as Entity} cost={cost} paid={paid} />
      ))}
      <Button variant="primary" size="sm">
        Pay
      </Button>
    </SecondaryCard>
  );
};

const SlotResourceDisplay: React.FC<{ resource: Entity; cost: bigint; paid: bigint }> = ({ resource, cost, paid }) => {
  return (
    <div>
      {paid.toLocaleString()}
      <ResourceIconTooltip
        name={getEntityTypeName(resource)}
        image={ResourceImage.get(resource) ?? ""}
        resource={resource}
        amount={cost}
        resourceType={ResourceType.Resource}
        short
      />
    </div>
  );
};
