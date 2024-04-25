// SwapPane.tsx
import { Dropdown } from "@/components/core/Dropdown";
import { IconLabel } from "@/components/core/IconLabel";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { swap } from "src/network/setup/contractCalls/swap";
import { getEntityTypeName } from "src/util/common";
import { EntityType, RESERVE_RESOURCE, ResourceImage, ResourceStorages } from "src/util/constants";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { getInAmount, getOutAmount } from "src/util/swap";

export const Swap = ({ marketEntity }: { marketEntity: Entity }) => {
  const mud = useMud();

  const [fromResource, setFromResource] = useState<Entity>(EntityType.Iron);
  const [toResource, setToResource] = useState<Entity>(EntityType.Copper);
  const [inAmountRendered, setInAmountRendered] = useState<string>("");
  const [outAmountRendered, setOutAmountRendered] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<"in" | "out">("in");

  const selectedRock = components.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("[Swap] No active rock");
  const getPath = useCallback((resourceIn: Entity, resourceOut: Entity) => {
    if (resourceIn == RESERVE_RESOURCE || resourceOut == RESERVE_RESOURCE) return [resourceIn, resourceOut];
    return [resourceIn, RESERVE_RESOURCE, resourceOut];
  }, []);

  const changeInAmount = useCallback(
    (resourceIn: Entity, resourceOut: Entity, inAmountRendered: string) => {
      setFromResource(resourceIn);
      setToResource(resourceOut);
      if (!inAmountRendered.includes(".") && !Number(inAmountRendered)) {
        setInAmountRendered("");
        setOutAmountRendered("");
        return;
      }
      setInAmountRendered(inAmountRendered);
      const inAmount = parseResourceCount(resourceIn, inAmountRendered);
      const path = getPath(resourceIn, resourceOut);
      const out = getOutAmount(inAmount, path);
      if (out == 0n) return "";
      const outString = formatResourceCount(resourceOut, out, { fractionDigits: 9, notLocale: true });
      setOutAmountRendered(outString);
      setLastEdited("in");
    },
    [getPath]
  );

  const swapUpdate = components.Swap.use(mud.playerAccount.entity);

  // update price after swap occurs
  useEffect(() => {
    changeInAmount(fromResource, toResource, inAmountRendered);
  }, [changeInAmount, swapUpdate]);

  const changeOutAmount = useCallback(
    (outAmountRendered: string) => {
      if (!outAmountRendered.includes(".") && !Number(outAmountRendered)) {
        setInAmountRendered("");
        setOutAmountRendered("");
        return;
      }

      setOutAmountRendered(outAmountRendered);
      const outAmount = parseResourceCount(toResource, outAmountRendered);
      const path = getPath(fromResource, toResource);
      const inAmount = getInAmount(outAmount, path);
      if (inAmount == 0n) return "";
      const inString = formatResourceCount(fromResource, inAmount, { fractionDigits: 9, notLocale: true });
      setInAmountRendered(inString);
      setLastEdited("out");
    },
    [fromResource, toResource, getPath]
  );

  const switchResources = useCallback(() => {
    lastEdited === "in"
      ? changeOutAmount(inAmountRendered)
      : changeInAmount(toResource, fromResource, outAmountRendered);

    setFromResource(toResource);
    setToResource(fromResource);
    setLastEdited(lastEdited === "in" ? "out" : "in");
  }, [lastEdited, changeInAmount, toResource, fromResource, outAmountRendered, changeOutAmount, inAmountRendered]);

  const { resourceCount: fromResourceCount } = useFullResourceCount(fromResource, selectedRock);
  const { resourceCount: toResourceCount, resourceStorage: toResourceStorage } = useFullResourceCount(
    toResource,
    selectedRock
  );

  const { disabled, message: swapButtonMsg } = useMemo(() => {
    if (!inAmountRendered || !outAmountRendered) return { disabled: true, message: "Enter an amount to swap" };

    if (fromResourceCount < parseResourceCount(fromResource, inAmountRendered))
      return { disabled: true, message: `Not enough ${getEntityTypeName(fromResource)}` };
    if (toResourceCount + parseResourceCount(toResource, outAmountRendered) > toResourceStorage)
      return { disabled: true, message: `Not enough space for ${getEntityTypeName(toResource)}` };
    return { disabled: false, message: "swap" };
  }, [
    fromResource,
    fromResourceCount,
    inAmountRendered,
    outAmountRendered,
    toResource,
    toResourceCount,
    toResourceStorage,
  ]);

  const handleSubmit = useCallback(() => {
    const inAmount = parseResourceCount(fromResource, inAmountRendered);
    const path = getPath(fromResource, toResource);
    if (path.length < 2) return;
    swap(mud, marketEntity, path, inAmount);
  }, [fromResource, inAmountRendered, getPath, toResource, mud, marketEntity]);

  return (
    <div className="w-[30rem] h-fit flex flex-col gap-2 m-3 items-center">
      <ResourceSelector
        placeholder="from"
        amount={inAmountRendered}
        onAmountChange={(value) => changeInAmount(fromResource, toResource, value)}
        resource={fromResource}
        onResourceSelect={(resource) => changeInAmount(resource, toResource, inAmountRendered)}
        className="row-span-4"
      />
      <div className="relative w-full z-10">
        <button
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 btn-sm btn-secondary"
          onClick={switchResources}
        >
          <FaExchangeAlt className="rotate-90" />
        </button>
      </div>

      <ResourceSelector
        placeholder="to"
        amount={outAmountRendered}
        onAmountChange={(value) => changeOutAmount(value)}
        resource={toResource}
        onResourceSelect={(resource) => changeInAmount(fromResource, resource, inAmountRendered)}
        className="row-span-4"
      />
      <TransactionQueueMask queueItemId={singletonEntity}>
        <Button className="btn-primary btn-lg w-full" disabled={disabled} onClick={handleSubmit}>
          {swapButtonMsg}
        </Button>
      </TransactionQueueMask>
    </div>
  );
};

interface ResourceSelectorProps {
  placeholder?: string;
  className?: string;
  amount: string;
  onAmountChange: (amount: string) => void;
  onResourceSelect: (resource: Entity) => void;
  resource: Entity;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = (props) => {
  const selectedAsteroid = components.ActiveRock.use()?.value ?? singletonEntity;
  const { resourceCount, resourceStorage } = useFullResourceCount(props.resource, selectedAsteroid);

  return (
    <div
      className={`w-full h-20 bg-base-100 relative border border-secondary grid grid-cols-10 px-2 items-center ${props.className}`}
    >
      <p className="absolute top-2 left-2 text-xs opacity-50">{props.placeholder ?? ""}</p>
      <input
        className="bg-transparent col-span-6 text-lg w-full h-full focus:outline-none"
        type="number"
        placeholder="0"
        value={props.amount}
        onChange={(e) => props.onAmountChange(e.target.value)}
      />
      <div className="col-span-4 flex flex-col justify-end items-end gap-1">
        <Dropdown>
          {[...ResourceStorages].map((resource) => (
            <Dropdown.Item
              key={resource}
              value={resource}
              onSelect={(value) => props.onResourceSelect(value as Entity)}
            >
              <IconLabel text={getEntityTypeName(resource)} imageUri={ResourceImage.get(resource) ?? ""} />
            </Dropdown.Item>
          ))}
        </Dropdown>
        <p className="text-xs font-bold uppercase opacity-60">
          {formatResourceCount(props.resource, resourceCount, { fractionDigits: 0 })} /{" "}
          {formatResourceCount(props.resource, resourceStorage, { fractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
};
