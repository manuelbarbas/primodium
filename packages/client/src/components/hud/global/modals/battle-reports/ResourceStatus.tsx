import React from "react";

import { formatResourceCount } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityToResourceImage } from "@/util/image";

export const ResourceStatus: React.FC<{
  resources: Record<Entity, { resourcesAtStart: bigint; resourcesAtEnd: bigint }>;
}> = ({ resources }) => {
  return (
    <div className="overflow-x-auto hide-scrollbar bg-glass p-2 flex flex-row items-center text-xs">
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
