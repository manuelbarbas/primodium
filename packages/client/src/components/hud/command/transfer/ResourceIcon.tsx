import { cn } from "@/util/client";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/image";
import { formatResourceCount, UnitStorages } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Button } from "@/components/core/Button";

export const ResourceIcon = ({
  resource,
  count,
  rawDelta,
  className,
  size = "md",
  onClick,
  disabled,
  negative,
}: {
  resource: Entity;
  count: bigint;
  rawDelta?: bigint;
  className?: string;
  onClick?: (aux?: boolean) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  negative?: boolean;
}) => {
  const formattedResourceCount = formatResourceCount(resource, count);
  const entityIsUnit = UnitStorages.has(resource);
  const delta = rawDelta ? (!negative ? -rawDelta : rawDelta) : 0n;

  return (
    <Button
      onClick={() => !disabled && onClick?.()}
      onAuxClick={() => !disabled && onClick?.(true)}
      className={cn(
        "relative flex flex-col gap-1 items-center justify-center cursor-pointer w-full h-full",
        disabled ? "disabled:opacity-100 disabled:text-opacity-100" : "",
        className
      )}
      disabled={disabled}
    >
      <img
        src={entityIsUnit ? EntityToUnitImage[resource] : EntityToResourceImage[resource]}
        className={cn("pixel-images", size == "md" ? "w-12" : "w-8")}
      />
      <p
        className={cn(
          size == "md" ? "text-sm" : formattedResourceCount.length > 8 ? "text-[0.6rem]" : "text-xs",
          "font-bold"
        )}
      >
        {formatResourceCount(resource, count, { short: false })}
      </p>
      <p className={cn("text-[0.6rem] -mt-1", delta && delta < 0n ? "text-error" : "text-success")}>
        {!!delta && delta !== 0n && `(${delta > 0n ? "+" : ""}${formatResourceCount(resource, delta)})`}
      </p>
    </Button>
  );
};
