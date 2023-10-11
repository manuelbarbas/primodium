import { Entity } from "@latticexyz/recs";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";
import { BlockNumber } from "src/network/components/clientComponents";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceType } from "src/util/constants";
import { IconLabel } from "../core/IconLabel";

export default function ResourceIconTooltip({
  image,
  resource,
  name,
  amount,
  scale = RESOURCE_SCALE,
  fontSize = "md",
  resourceType = ResourceType.Resource,
  validate = false,
  direction = "right",
  className,
  playerEntity,
}: {
  image: string;
  resource: Entity;
  resourceType?: ResourceType;
  name: string;
  amount: bigint;
  inline?: boolean;
  scale?: bigint;
  fontSize?: string;
  validate?: boolean;
  direction?: "top" | "bottom" | "right" | "left";
  className?: string;
  playerEntity: Entity;
}) {
  const hasEnough = useHasEnoughOfResource(resource, amount, playerEntity, resourceType);
  const { avgBlockTime } = BlockNumber.use(undefined, {
    value: 0n,
    avgBlockTime: 1,
  });

  const label =
    ResourceType.ResourceRate !== resourceType
      ? amount !== 0n
        ? formatNumber(amount / scale, 0)
        : "--"
      : `${formatNumber(Number((amount * 60n) / scale) / avgBlockTime, 1)}/MIN`;

  return (
    <IconLabel
      imageUri={image}
      text={label}
      tooltipDirection={direction}
      tooltipText={name}
      className={`text-${fontSize} font-bold ${className} ${!hasEnough && validate ? `text-error animate-pulse ` : ""}`}
    />
  );
}
