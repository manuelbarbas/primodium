// SwapPane.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";

import {
  EntityType,
  formatResourceCount,
  getEntityTypeName,
  parseResourceCount,
  RESERVE_RESOURCE,
  ResourceStorages,
} from "@primodiumxyz/core";
import { useAccountClient, useCore, useResourceCount } from "@primodiumxyz/core/react";
import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";
import { SecondaryCard } from "@/components/core/Card";
import { Dropdown } from "@/components/core/Dropdown";
import { IconLabel } from "@/components/core/IconLabel";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { useContractCalls } from "@/hooks/useContractCalls";
import { EntityToResourceImage } from "@/util/image";

export const Swap = ({ marketEntity }: { marketEntity: Entity }) => {
  const { tables, utils } = useCore();
  const { playerAccount } = useAccountClient();
  const { swap } = useContractCalls();

  const [fromResource, setFromResource] = useState<Entity>(EntityType.Iron);
  const [toResource, setToResource] = useState<Entity>(EntityType.Copper);
  const [inAmountRendered, setInAmountRendered] = useState<string>("");
  const [outAmountRendered, setOutAmountRendered] = useState<string>("");
  const [lastEdited, setLastEdited] = useState<"in" | "out">("in");
  const [slippageRendered, setSlippageRendered] = useState<string>("0.5");
  const [outAmountMinRendered, setOutAmountMinRendered] = useState<string>("");

  const selectedRock = tables.ActiveRock.use()?.value;
  if (!selectedRock) throw new Error("[Swap] No active rock");
  const getPath = useCallback((resourceIn: Entity, resourceOut: Entity) => {
    if (resourceIn == RESERVE_RESOURCE || resourceOut == RESERVE_RESOURCE) return [resourceIn, resourceOut];
    return [resourceIn, RESERVE_RESOURCE, resourceOut];
  }, []);

  const changeOutAmountMin = useCallback(
    (outAmountRendered: string, slippageRendered: string) => {
      if (!outAmountRendered || !slippageRendered) slippageRendered = "0.5";
      const outAmount = parseResourceCount(toResource, outAmountRendered);
      const slippageFloat = parseFloat(slippageRendered) * 100;
      const slippage = BigInt(slippageFloat);
      const outAmountMin = outAmount - (outAmount * slippage) / 100n / 100n;
      if (outAmountMin == 0n) return "";
      const outAmountMinString = formatResourceCount(toResource, outAmountMin, { fractionDigits: 9, notLocale: true });
      setOutAmountMinRendered(outAmountMinString);
      return outAmountMin;
    },
    [toResource],
  );

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
      const out = utils.getOutAmount(inAmount, path);
      if (out == 0n) return "";
      const outString = formatResourceCount(resourceOut, out, { fractionDigits: 9, notLocale: true });
      setOutAmountRendered(outString);
      setLastEdited("in");

      changeOutAmountMin(outString, slippageRendered);
    },
    [getPath, changeOutAmountMin, slippageRendered],
  );

  const swapUpdate = tables.Swap.use(playerAccount.entity);

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
      const inAmount = utils.getInAmount(outAmount, path);
      if (inAmount == 0n) return "";
      const inString = formatResourceCount(fromResource, inAmount, { fractionDigits: 9, notLocale: true });
      setInAmountRendered(inString);
      setLastEdited("out");

      changeOutAmountMin(outAmountRendered, slippageRendered);
    },
    [fromResource, toResource, getPath, changeOutAmountMin, slippageRendered],
  );

  const changeSlippage = useCallback(
    (slippageRendered: string) => {
      if (!slippageRendered.includes(".") && !Number(slippageRendered)) {
        setSlippageRendered("");
        return;
      }

      const floatSlippage = parseFloat(slippageRendered);
      const truncatedSlippage = parseFloat(floatSlippage.toFixed(1));
      const clampedSlippage = Math.min(Math.max(truncatedSlippage, 0.1), 99);
      const slippage = clampedSlippage.toString();

      setSlippageRendered(slippage);
      changeOutAmountMin(outAmountRendered, slippage);
    },
    [changeOutAmountMin, outAmountRendered],
  );

  const switchResources = useCallback(() => {
    lastEdited === "in"
      ? changeOutAmount(inAmountRendered)
      : changeInAmount(toResource, fromResource, outAmountRendered);

    setFromResource(toResource);
    setToResource(fromResource);
    setLastEdited(lastEdited === "in" ? "out" : "in");
  }, [lastEdited, changeInAmount, toResource, fromResource, outAmountRendered, changeOutAmount, inAmountRendered]);

  const { resourceCount: fromResourceCount } = useResourceCount(fromResource, selectedRock);
  const { resourceCount: toResourceCount, resourceStorage: toResourceStorage } = useResourceCount(
    toResource,
    selectedRock,
  );

  const { disabled, message: swapButtonMsg } = useMemo(() => {
    if (!inAmountRendered || !outAmountRendered) return { disabled: true, message: "Enter amount" };

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
    const outAmountMin = parseResourceCount(toResource, outAmountMinRendered);
    const path = getPath(fromResource, toResource);
    if (path.length < 2) return;
    swap(marketEntity, path, inAmount, outAmountMin);
  }, [fromResource, inAmountRendered, getPath, toResource, outAmountMinRendered, marketEntity]);

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
        outAmountMin={outAmountMinRendered}
      />
      <div className="items-center w-full h-full pt-2 grid grid-cols-2 justify-items-start">
        <SlippageInput
          placeholder="Slippage"
          amount={slippageRendered}
          onAmountChange={(amount) => changeSlippage(amount)}
        />
        <TransactionQueueMask queueItemId={defaultEntity} className="justify-self-end">
          <Button className="btn-primary btn-lg justify-self-end" disabled={disabled} onClick={handleSubmit}>
            {swapButtonMsg}
          </Button>
        </TransactionQueueMask>
      </div>
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
  outAmountMin?: string;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = (props) => {
  const { tables } = useCore();
  const selectedAsteroid = tables.ActiveRock.use()?.value ?? defaultEntity;
  const { resourceCount, resourceStorage } = useResourceCount(props.resource, selectedAsteroid);

  return (
    <SecondaryCard className={`w-full h-20 relative grid grid-cols-10 p-2 items-center ${props.className}`}>
      <p className="absolute top-2 left-2 text-xs opacity-50">{props.placeholder ?? ""}</p>
      <div className="col-span-6 flex flex-col">
        <input
          className="bg-transparent text-lg w-3/4 h-3/4 focus:outline-none"
          type="number"
          placeholder="0"
          value={props.amount}
          onChange={(e) => props.onAmountChange(e.target.value)}
        />
        {props.outAmountMin && !isNaN(Number(props.outAmountMin)) && (
          <p className="text-xs font-bold uppercase opacity-60 absolute bottom-1">Minimum: {props.outAmountMin}</p>
        )}
      </div>
      <div className="col-span-4 flex flex-col justify-end items-end gap-1">
        <Dropdown value={props.resource} onChange={(value) => props.onResourceSelect(value)}>
          {[...ResourceStorages].map((resource) => (
            <Dropdown.Item key={resource} value={resource}>
              <IconLabel text={getEntityTypeName(resource)} imageUri={EntityToResourceImage[resource] ?? ""} />
            </Dropdown.Item>
          ))}
        </Dropdown>
        <p className="text-xs font-bold uppercase opacity-60">
          {formatResourceCount(props.resource, resourceCount, { fractionDigits: 0 })} /{" "}
          {formatResourceCount(props.resource, resourceStorage, { fractionDigits: 0 })}
        </p>
      </div>
    </SecondaryCard>
  );
};

interface SlippageInputProps {
  placeholder?: string;
  className?: string;
  amount: string;
  onAmountChange: (amount: string) => void;
}

const SlippageInput: React.FC<SlippageInputProps> = (props) => {
  return (
    <SecondaryCard className={`h-full pt-2 flex flex-col justify-around ${props.className}`}>
      <p className="text-xs opacity-50">{props.placeholder ?? ""}</p>
      <div className="flex justify-between items-center">
        <input
          className="bg-transparent text-base opacity-80 w-auto h-5 focus:outline-none pr-4 justify-start text-left"
          type="number"
          placeholder="0.5"
          step="0.1"
          min="0.1"
          max="99"
          value={props.amount}
          onChange={(e) => props.onAmountChange(e.target.value)}
        />
        <span className="opacity-80">%</span>
      </div>
    </SecondaryCard>
  );
};
