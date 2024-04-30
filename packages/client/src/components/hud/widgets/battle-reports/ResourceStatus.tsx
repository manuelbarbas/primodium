import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import React from "react";
import { formatResourceCount } from "src/util/number";

export const ResourceStatus: React.FC<{
  resources: Record<Entity, { resourcesAtStart: bigint; resourcesAtEnd: bigint }>;
}> = ({ resources }) => {
  return (
    <div className="flex gap-3 p-1 bg-white/[.06]">
      {Object.entries(resources).map(([resource, data], i) => {
        const resourceDelta = data.resourcesAtEnd - data.resourcesAtStart;
        return (
          <div key={`resource-${i}`} className={`flex items-center`}>
            <img src={EntityToResourceImage[resource] ?? ""} className={`w-8 h-8 p-1`} />

            <p
              className={`grid place-items-center text-sm p-1 uppercase font-bold w-full h-full ${
                resourceDelta > 0n ? "text-success" : "text-error"
              }`}
            >
              {formatResourceCount(resource as Entity, resourceDelta, {
                short: true,
                showZero: true,
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
};
