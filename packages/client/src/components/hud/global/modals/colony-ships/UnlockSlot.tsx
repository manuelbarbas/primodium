import { Button } from "@/components/core/Button";
import { CapacityBar } from "@/components/core/CapacityBar";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { NumberInput } from "@/components/core/NumberInput";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useMud } from "@/hooks";
import { useColonySlots, getColonySlotsCostMultiplier } from "@/hooks/useColonySlots";
import { useFullResourceCount } from "@/hooks/useFullResourceCount";
import { components } from "@/network/components";
import { payForColonySlot } from "@/network/setup/contractCalls/payForColonySlot";
import { ResourceEnumLookup } from "@/util/constants";
import { EntityToResourceImage } from "@/util/mappings";
import { formatResourceCount, parseResourceCount } from "@/util/number";
import { getFullResourceCount } from "@/util/resource";
import { bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import React, { useEffect, useMemo, useState } from "react";
import { Hex } from "viem";

export const UnlockSlot: React.FC<{
  playerEntity: Entity;
  buildingEntity: Entity;
  asteroidEntity: Entity;
  className?: string;
  index: number;
}> = ({ asteroidEntity, buildingEntity, playerEntity, className = "" }) => {
  const mud = useMud();
  const colonySlotsData = useColonySlots(playerEntity);
  const [activeResource, setActiveResource] = useState<Entity | null>(null);
  const [activeResourceCount, setActiveResourceCount] = useState("0");

  const max = useMemo(() => {
    if (!activeResource) return 0;
    const resourceData = getFullResourceCount(activeResource, asteroidEntity);
    if (!resourceData) return 0;
    const resourceCosts = colonySlotsData.resourceCosts[activeResource];
    const resourcesLeft = resourceCosts.cost - resourceCosts.paid;
    const resourceCount = resourceData.resourceCount;
    const ret = bigIntMin(resourcesLeft, resourceCount);
    return Number(formatResourceCount(activeResource, ret, { notLocale: true, showZero: true }));
  }, [activeResource, asteroidEntity, colonySlotsData.resourceCosts]);

  useEffect(() => {
    setActiveResourceCount("0");
  }, [activeResource]);

  const handleSubmit = () => {
    if (!activeResource) return;
    payForColonySlot(mud, buildingEntity, {
      [activeResource]: BigInt(parseResourceCount(activeResource, activeResourceCount)),
    });
    setActiveResourceCount("0");
  };
  return (
    <SecondaryCard className={`flex flex-col gap-3 p-2 justify-center items-center ${className}`}>
      <p>Add Slot</p>
      {Object.entries(colonySlotsData.resourceCosts).map(([resource], i) => (
        <SlotResourceDisplay
          key={`slot-resource-${i}`}
          playerEntity={playerEntity}
          asteroidEntity={asteroidEntity}
          resource={resource as Entity}
          onClick={() => setActiveResource(resource as Entity)}
          active={activeResource === resource}
        />
      ))}

      {activeResource && <NumberInput count={activeResourceCount} max={max} onChange={setActiveResourceCount} />}
      {!activeResource && <NumberInput count={"0"} max={0} />}

      <TransactionQueueMask queueItemId={"pay" as Entity}>
        <Button variant="primary" size="sm" disabled={activeResourceCount == "0"} onClick={handleSubmit}>
          Pay
        </Button>
      </TransactionQueueMask>
    </SecondaryCard>
  );
};

const SlotResourceDisplay: React.FC<{
  active?: boolean;
  playerEntity: Entity;
  asteroidEntity: Entity;
  resource: Entity;
  onClick?: () => void;
}> = ({ active, asteroidEntity, playerEntity, resource, onClick }) => {
  const resourceCount = useFullResourceCount(resource, asteroidEntity)?.resourceCount;

  const config = components.P_ColonySlotsConfig.use();
  if (!config) throw new Error("No colony slots config found");
  const index = config?.resources.findIndex((r) => r === ResourceEnumLookup[resource]);
  const paid =
    components.ColonySlotsInstallments.useWithKeys({
      playerEntity: playerEntity as Hex,
      resourceIndex: BigInt(index),
    })?.amounts ?? 0n;

  const costMultiplier = getColonySlotsCostMultiplier(playerEntity);
  const cost = config.amounts[index] * costMultiplier;
  const complete = cost == paid;

  let content = "";
  if (complete) content = "COMPLETE";
  else content = `${formatResourceCount(resource, paid)} / ${formatResourceCount(resource, cost, { short: true })}`;
  return (
    <Button size="content" onClick={onClick} className={`w-full gap-1 ${active ? "ring ring-secondary" : ""}`}>
      <IconLabel imageUri={EntityToResourceImage[resource] ?? ""} text={content} />
      <CapacityBar className="w-full" current={paid} max={cost} segments={20} />
      {!complete && (
        <p className="self-end text-xs opacity-50">Available: {formatResourceCount(resource, resourceCount ?? 0n)}</p>
      )}
    </Button>
  );
};
