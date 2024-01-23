// SwapPane.tsx
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import React, { useCallback, useMemo, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { components } from "src/network/components";
import { swap } from "src/network/setup/contractCalls/swap";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESERVE_RESOURCE, ResourceStorages } from "src/util/constants";
import { formatResource, parseResource } from "src/util/resource";
import { getInAmount, getOutAmount } from "src/util/swap";

export const Swap = ({ marketEntity }: { marketEntity: Entity }) => {
  const mud = useMud();
  const [fromResource, setFromResource] = useState<Entity>(EntityType.Iron);
  const [toResource, setToResource] = useState<Entity>(EntityType.Copper);
  const [inAmountRendered, setInAmountRendered] = useState<string>("");
  const [outAmountRendered, setOutAmountRendered] = useState<string>("");

  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;
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
      const inAmount = parseResource(resourceIn, inAmountRendered);
      const path = getPath(resourceIn, resourceOut);
      const out = getOutAmount(inAmount, path);
      if (out == 0n) return "";
      const outString = formatResource(resourceOut, out, 9);
      setOutAmountRendered(outString);
    },
    [getPath]
  );

  const changeOutAmount = useCallback(
    (outAmountRendered: string) => {
      if (!outAmountRendered.includes(".") && !Number(outAmountRendered)) {
        setInAmountRendered("");
        setOutAmountRendered("");
        return;
      }

      setOutAmountRendered(outAmountRendered);
      const outAmount = parseResource(toResource, outAmountRendered);
      const path = getPath(fromResource, toResource);
      const inAmount = getInAmount(outAmount, path);
      if (inAmount == 0n) return "";
      const inString = formatResource(fromResource, inAmount, 9);
      setInAmountRendered(inString);
    },
    [fromResource, toResource, getPath]
  );

  const switchResources = useCallback(() => {
    setFromResource(toResource);
    setToResource(fromResource);
    changeInAmount(toResource, fromResource, outAmountRendered);
  }, [fromResource, toResource, outAmountRendered, changeInAmount]);

  const { resourceCount: fromResourceCount } = useFullResourceCount(fromResource, selectedRock);
  const { resourceCount: toResourceCount, resourceStorage: toResourceStorage } = useFullResourceCount(
    toResource,
    selectedRock
  );

  const { disabled, message: swapButtonMsg } = useMemo(() => {
    if (!inAmountRendered || !outAmountRendered) return { disabled: true, message: "Enter an amount to swap" };

    if (fromResourceCount < parseResource(fromResource, inAmountRendered))
      return { disabled: true, message: "Not enough resources" };
    if (toResourceCount + parseResource(toResource, outAmountRendered) > toResourceStorage)
      return { disabled: true, message: "Not enough space" };
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
    const inAmount = parseResource(fromResource, inAmountRendered);
    const path = getPath(fromResource, toResource);
    if (path.length < 2) return;
    swap(mud, marketEntity, path, inAmount);
  }, [fromResource, inAmountRendered, getPath, toResource, mud, marketEntity]);

  return (
    <div className="w-[30rem] grid grid-rows-11 gap-2 m-3 items-center">
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
        showSpaceRemaining
      />
      <TransactionQueueMask queueItemId={singletonEntity}>
        <Button className="btn-primary btn-lg w-full mt-2" disabled={disabled} onClick={handleSubmit}>
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
  showSpaceRemaining?: boolean;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = (props) => {
  const selectedAsteroid = components.SelectedRock.use()?.value ?? singletonEntity;
  const { resourceCount, resourceStorage } = useFullResourceCount(props.resource, selectedAsteroid);
  return (
    <div
      className={`w-full h-20 bg-base-100 relative border border-secondary flex px-2 items-center ${props.className}`}
    >
      <p className="absolute top-2 left-2 text-xs opacity-50">{props.placeholder ?? ""}</p>
      <input
        className="bg-transparent text-lg w-full h-full focus:outline-none"
        type="number"
        placeholder="0"
        value={props.amount}
        onChange={(e) => props.onAmountChange(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <select
          id="resource-select"
          value={props.resource}
          className="bg-black/20 h-fit p-1 text-center"
          onChange={(e) => props.onResourceSelect(e.target.value as Entity)}
        >
          {[...ResourceStorages].map((resource) => (
            <option key={resource} value={resource}>
              {getBlockTypeName(resource)}
            </option>
          ))}
        </select>
        <p className="text-xs font-bold uppercase text-right opacity-70">
          {props.showSpaceRemaining
            ? `Space: ${formatResource(props.resource, resourceStorage - resourceCount, 0)}`
            : `Balance: ${formatResource(props.resource, resourceCount, 0)}`}
        </p>
      </div>
    </div>
  );
};
