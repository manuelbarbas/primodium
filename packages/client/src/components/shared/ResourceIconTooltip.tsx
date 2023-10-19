import { Entity } from "@latticexyz/recs";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceType } from "src/util/constants";
import { IconLabel } from "../core/IconLabel";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";

type ResourceIconProps = {
  image: string;
  resource: Entity;
  resourceType?: ResourceType;
  name: string;
  amount: bigint;
  inline?: boolean;
  scale?: bigint;
  fontSize?: string;
  direction?: "top" | "bottom" | "right" | "left";
  className?: string;
  playerEntity: Entity;
  validate?: boolean;
};

const ResourceIconTooltipContent = ({
  resourceType,
  amount,
  scale = RESOURCE_SCALE,
  image,
  name,
  direction,
  fontSize = "md",
  className,
  hasEnough,
}: ResourceIconProps & { hasEnough: boolean }) => {
  const label =
    ResourceType.ResourceRate !== resourceType
      ? amount !== 0n
        ? formatNumber(amount / scale, 0)
        : "--"
      : `${formatNumber(Number((amount * 60n) / scale), 1)}/MIN`;

  return (
    <IconLabel
      imageUri={image}
      text={label}
      tooltipDirection={direction}
      tooltipText={name}
      className={`text-${fontSize} font-bold ${className} ${!hasEnough ? `text-error animate-pulse ` : ""}`}
    />
  );
};

const ResourceIconTooltipValidate = (props: ResourceIconProps) => {
  const hasEnough = useHasEnoughOfResource(props.resource, props.amount, props.playerEntity, props.resourceType);
  return <ResourceIconTooltipContent {...props} hasEnough={hasEnough} />;
};

export const ResourceIconTooltip = (props: ResourceIconProps) => {
  if (props.validate) {
    return <ResourceIconTooltipValidate {...props} />;
  } else {
    return <ResourceIconTooltipContent {...props} hasEnough={true} />;
  }
};
