import { Button } from "@/components/core/Button";
import { CapacityBar } from "@/components/core/CapacityBar";
import { SecondaryCard } from "@/components/core/Card";
import { IconLabel } from "@/components/core/IconLabel";
import { NumberInput } from "@/components/core/NumberInput";
import { useMud } from "@/hooks";
import { useColonySlots } from "@/hooks/useColonySlots";
import { useFullResourceCount } from "@/hooks/useFullResourceCount";
import { components } from "@/network/components";
import { payForColonySlot } from "@/network/setup/contractCalls/payForColonySlot";
import { getEntityTypeName } from "@/util/common";
import { ResourceImage } from "@/util/constants";
import { formatResourceCount, parseResourceCount } from "@/util/number";
import { getFullResourceCount } from "@/util/resource";
import { bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import React, { useEffect, useMemo, useState } from "react";

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

  const time = components.Time.use()?.value;

  const max = useMemo(() => {
    if (!activeResource) return 0;
    const resourceData = getFullResourceCount(activeResource, asteroidEntity);
    if (!resourceData) return 0;
    const resourceCosts = colonySlotsData.resourceCosts[activeResource];
    const resourcesLeft = resourceCosts.cost - resourceCosts.paid;
    const resourceStorage = resourceData.resourceStorage;
    const ret = bigIntMin(resourcesLeft, resourceStorage);
    return Number(formatResourceCount(activeResource, ret, { notLocale: true, showZero: true }));
  }, [time]);

  useEffect(() => {
    setActiveResourceCount("0");
  }, [activeResource]);

  const handleSubmit = () => {
    if (!activeResource) return;
    payForColonySlot(mud, buildingEntity, {
      [activeResource]: BigInt(parseResourceCount(activeResource, activeResourceCount)),
    });
    setActiveResource(null);
  };
  return (
    <SecondaryCard className={`h-full max-w-[250px] flex flex-col gap-6 p-3 justify-center items-center ${className}`}>
      <p>Add Slot</p>
      {Object.entries(colonySlotsData.resourceCosts).map(([resource, { cost, paid }], i) => (
        <SlotResourceDisplay
          key={`slot-resource-${i}`}
          asteroidEntity={asteroidEntity}
          resource={resource as Entity}
          cost={cost}
          paid={paid}
          onClick={() => setActiveResource(resource as Entity)}
          active={activeResource === resource}
        />
      ))}

      {activeResource && <NumberInput count={activeResourceCount} max={max} onChange={setActiveResourceCount} />}
      {!activeResource && <NumberInput count={"0"} max={0} />}

      <Button variant="primary" size="sm" disabled={activeResourceCount == "0"} onClick={handleSubmit}>
        Pay
      </Button>
    </SecondaryCard>
  );
};

const SlotResourceDisplay: React.FC<{
  active?: boolean;
  asteroidEntity: Entity;
  resource: Entity;
  cost: bigint;
  paid: bigint;
  onClick?: () => void;
}> = ({ active, asteroidEntity, resource, cost, paid, onClick }) => {
  const resourceCount = useFullResourceCount(asteroidEntity, resource)?.resourceCount;
  return (
    <Button size="content" onClick={onClick} className={active ? "ring ring-secondary" : ""}>
      <IconLabel imageUri={ResourceImage.get(resource) ?? ""} text={getEntityTypeName(resource)} />
      <p>Balance: {formatResourceCount(resource, resourceCount ?? 0n)}</p>
      <CapacityBar current={paid} max={cost} segments={20} />
      <p className="self-end text-xs opacity-50">
        {formatResourceCount(resource, paid)} / {formatResourceCount(resource, cost)}
      </p>
    </Button>
  );
};
