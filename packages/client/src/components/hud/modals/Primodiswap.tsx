// SwapPane.tsx
import { Entity } from "@latticexyz/recs";
import React, { useCallback, useState } from "react";
import { Card } from "src/components/core/Card";
import { getBlockTypeName } from "src/util/common";
import { EntityType, RESERVE_RESOURCE } from "src/util/constants";
import { formatResource, parseResource } from "src/util/resource";
import { getInAmount, getOutAmount } from "src/util/swap";

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
  EntityType.Kimberlite,
  EntityType.Iridium,
  EntityType.Titanium,
  EntityType.Platinum,
]);

export const Primodiswap = () => {
  const [fromResource, setFromResource] = useState<Entity>(EntityType.Iron);
  const [toResource, setToResource] = useState<Entity>(EntityType.Copper);
  const [inAmountRendered, setInAmountRendered] = useState<string>("");
  const [outAmountRendered, setOutAmountRendered] = useState<string>("");

  const getPath = useCallback((resourceIn: Entity, resourceOut: Entity) => {
    if (resourceIn == RESERVE_RESOURCE || resourceOut == RESERVE_RESOURCE) return [resourceIn, resourceOut];
    return [resourceIn, RESERVE_RESOURCE, resourceOut];
  }, []);

  const changeInAmount = useCallback(
    (resourceIn: Entity, resourceOut: Entity, inAmountRendered: string) => {
      setFromResource(resourceIn);
      setToResource(resourceOut);
      if (!inAmountRendered) {
        setInAmountRendered("");
        setOutAmountRendered("");
        return;
      }
      setInAmountRendered(inAmountRendered);
      const inAmount = parseResource(resourceIn, inAmountRendered);
      const path = getPath(resourceIn, resourceOut);
      const out = getOutAmount(inAmount, path);
      if (out == 0n) return "";
      const outString = formatResource(resourceOut, out);
      setOutAmountRendered(outString);
    },
    [getPath]
  );

  const changeOutAmount = useCallback(
    (outAmountRendered: string) => {
      if (!outAmountRendered) {
        setInAmountRendered("");
        setOutAmountRendered("");
        return;
      }

      setOutAmountRendered(outAmountRendered);
      const outAmount = parseResource(toResource, outAmountRendered);
      const path = getPath(fromResource, toResource);
      const inAmount = getInAmount(outAmount, path);
      if (inAmount == 0n) return "";
      const inString = formatResource(fromResource, inAmount);
      setInAmountRendered(inString);
    },
    [fromResource, toResource, getPath]
  );

  return (
    <Card className="w-full h-full gap-4">
      <ResourceSelector
        resource={fromResource}
        onResourceSelect={(resource) => changeInAmount(resource, toResource, inAmountRendered)}
      />
      <input
        className="bg-black font-white"
        type="number"
        value={inAmountRendered}
        onChange={(e) => changeInAmount(fromResource, toResource, e.target.value)}
      />
      <ResourceSelector
        resource={toResource}
        onResourceSelect={(resource) => changeInAmount(fromResource, resource, inAmountRendered)}
      />
      <input
        className="bg-black font-white"
        type="number"
        value={outAmountRendered}
        onChange={(e) => changeOutAmount(e.target.value)}
      />
    </Card>
  );
};

interface ResourceSelectorProps {
  onResourceSelect: (resource: Entity) => void;
  resource: Entity;
}

const ResourceSelector: React.FC<ResourceSelectorProps> = ({ resource, onResourceSelect }) => {
  return (
    <div>
      <label htmlFor="resource-select" className="block text-sm font-medium font-white">
        Select a resource
      </label>
      <select
        id="resource-select"
        value={resource}
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
