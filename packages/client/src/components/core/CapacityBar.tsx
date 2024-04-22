import { Entity } from "@latticexyz/recs";
import React, { FC } from "react";
import { EntityType } from "src/util/constants";

type SegmentedCapacityBarProps = {
  current: bigint;
  max: bigint | null;
  segments: number;
  resourceType: Entity;
};

export const CapacityBar: FC<SegmentedCapacityBarProps> = ({ current, max, segments, resourceType }) => {
  // Calculate the number of filled segments
  const filledSegments = max !== null && max > 0n ? Math.round((Number(current) / Number(max)) * segments) : 0;

  //   console.log(current / max);
  const segmentColor = (index: number) => {
    if (current === max && index === segments - 1) return "bg-error";
    if (resourceType === EntityType.Electricity) {
      if (index < 4) return "bg-amber-200/80";
      if (index < 7) return "bg-amber-300/90";
      return "bg-yellow-500";
    } else {
      // Default color scheme
      if (index < 4) return "bg-emerald-400";
      if (index < 7) return "bg-emerald-600";
      return "bg-emerald-900";
    }
  };

  return (
    <div className="relative w-full bg-transparent overflow-hidden h-6 flex p-0.5 gap-0.5">
      {[...Array(segments)].map((_, index) => (
        <div
          key={index}
          className={`flex-1 h-full transition-all duration-500 ${
            index < filledSegments ? segmentColor(index) : "bg-gray-400/20"
          }`}
        />
      ))}
    </div>
  );
};
