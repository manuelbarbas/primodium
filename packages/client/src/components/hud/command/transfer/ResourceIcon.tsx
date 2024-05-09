import { cn } from "@/util/client";
import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import React from "react";
import { FaSync } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { formatResourceCount } from "src/util/number";

export const ResourceIcon = ({
  resource,
  count,
  delta,
  className,
  setDragging = () => null,
  onClear,
  disableClear,
  size = "md",
  disabled,
}: {
  resource: Entity;
  count: bigint;
  delta?: bigint;
  className?: string;
  setDragging?: (e: React.MouseEvent, entity: Entity) => void;
  onClear?: (entity: Entity) => void;
  disableClear?: boolean;
  size?: "sm" | "md";
  disabled?: boolean;
}) => {
  const formattedResourceCount = formatResourceCount(resource, count);
  return (
    <Button
      onMouseDown={(e) => !disabled && setDragging(e, resource)}
      className={cn("relative flex flex-col gap-1 items-center justify-center cursor-pointer w-full h-full", className)}
    >
      <img
        src={EntityToResourceImage[resource]}
        className={cn(
          "pixel-images",
          size == "md" ? "w-12" : "w-10",
          "scale-200 font-bold text-lg pointer-events-none"
        )}
      />
      <p
        className={cn(
          size == "sm" ? "text-sm" : formattedResourceCount.length > 8 ? "text-[0.6rem]" : "text-xs",
          "font-bold"
        )}
      >
        {formatResourceCount(resource, count, { short: false })}
      </p>
      <p className={cn("text-[0.6rem]", delta && delta < 0n ? "text-error" : "text-success")}>
        {!!delta && delta !== 0n && `(${delta > 0n ? "+" : ""}${formatResourceCount(resource, delta)})`}
      </p>
      {onClear && (
        <Button
          className="btn-ghost btn-xs absolute bottom-0 right-0"
          disabled={disableClear}
          onClick={() => onClear(resource)}
          tooltip={"Clear"}
          tooltipDirection="bottom"
        >
          <FaSync className="text-error scale-x-[-1]" />
        </Button>
      )}
    </Button>
  );
};
