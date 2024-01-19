// SwapPane.tsx
import { Entity } from "@latticexyz/recs";
import React, { useCallback, useEffect, useState } from "react";
import { Card } from "src/components/core/Card";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESERVE_RESOURCE, RESOURCE_SCALE } from "src/util/constants";
import { getInAmount, getOutAmount } from "src/util/swap";
import { formatEther } from "viem";

const tradeableResources = new Set([
  EntityType.Iron,
  EntityType.Copper,
  EntityType.Lithium,
  EntityType.IronPlate,
  EntityType.PVCell,
  EntityType.Alloy,
  EntityType.IronPlate,
  EntityType.PVCell,
  EntityType.Alloy,
]);

export const Primodiswap = () => {
  const [fromResource, setFromResource] = useState<Entity | null>(null);
  const [toResource, setToResource] = useState<Entity | null>(null);
  const [inAmount, setInAmount] = useState<string>("");
  const [outAmount, setOutAmount] = useState<string>("");

  const getPath = useCallback(() => {
    if (!fromResource || !toResource) return [];
    if (fromResource == RESERVE_RESOURCE || toResource == RESERVE_RESOURCE) return [fromResource, toResource];
    return [fromResource, RESERVE_RESOURCE, toResource];
  }, [fromResource, toResource]);

  useEffect(() => {
    if (!inAmount) return setOutAmount("");
    const path = getPath();
    console.log("path", path);

    const out = getOutAmount(BigInt(inAmount) * RESOURCE_SCALE, path);
    console.log("in amount", inAmount, "out amount", out);
    if (out == 0n) return setOutAmount("");

    const outString = formatEther(out);
    if (outAmount == outString) return;
    setOutAmount(outString);
  }, [inAmount, getPath]);

  useEffect(() => {
    if (!outAmount) return setInAmount("");
    const path = getPath();

    const inRes = getInAmount(BigInt(outAmount) * RESOURCE_SCALE, path);

    if (inRes == 0n) return setInAmount("");

    const inString = formatEther(inRes);
    if (inAmount == inString) return;

    setInAmount(inString);
  }, [outAmount, getPath]);

  return (
    <Card className="w-full h-full gap-4">
      <ResourceSelector onResourceSelect={setFromResource} />
      <input
        className="bg-black font-white"
        type="number"
        value={inAmount}
        onChange={(e) => setInAmount(e.target.value)}
      />
      <ResourceSelector onResourceSelect={setToResource} />
      <input
        className="bg-black font-white"
        type="number"
        value={outAmount}
        onChange={(e) => setOutAmount(e.target.value)}
      />
      <ExchangeInfo fromResource={fromResource} toResource={toResource} />
    </Card>
  );
};

interface ResourceSelectorProps {
  onResourceSelect: (resource: Entity) => void;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({ onResourceSelect }) => {
  return (
    <div>
      <label htmlFor="resource-select" className="block text-sm font-medium font-white">
        Select a resource
      </label>
      <select
        id="resource-select"
        className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 focus:outline-none font-white bg-black"
        onChange={(e) => onResourceSelect(e.target.value as Entity)}
      >
        {[...tradeableResources].map((resource) => (
          <option key={resource} value={resource}>
            {getBlockTypeName(resource)}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ExchangeInfoProps {
  fromResource: Entity | null;
  toResource: Entity | null;
}

const ExchangeInfo: React.FC<ExchangeInfoProps> = ({ fromResource, toResource }) => {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium">Exchange Information</div>
      <div className="">From Resource: {fromResource ? getBlockTypeName(fromResource) : ""}</div>
      <div className="">To Resource: {toResource ? getBlockTypeName(toResource) : ""}</div>
      {/* Add more exchange-related information here */}
    </div>
  );
};
