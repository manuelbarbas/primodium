import { Entity } from "@latticexyz/recs";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";
import { formatNumber } from "src/util/common";
import { ResourceType } from "src/util/constants";
import { getScale } from "src/util/resource";
import { IconLabel } from "../core/IconLabel";

type ResourceIconProps = {
  image: string;
  resource: Entity;
  resourceType?: ResourceType;
  name: string;
  amount: bigint;
  inline?: boolean;
  fontSize?: string;
  direction?: "top" | "bottom" | "right" | "left";
  className?: string;
  spaceRock?: Entity;
  validate?: boolean;
  short?: boolean;
  fractionDigits?: number;
};

const suffixes = {
  [ResourceType.Utility]: "",
  [ResourceType.ResourceRate]: "/MIN",
  [ResourceType.Resource]: "",
  [ResourceType.Multiplier]: "x",
};

const ResourceIconTooltipContent = ({
  resourceType,
  amount,
  image,
  name,
  direction,
  fontSize = "md",
  className,
  hasEnough,
  short = false,
  fractionDigits = 0,
  resource,
}: ResourceIconProps & { hasEnough: boolean }) => {
  let value = Number(amount);
  if (resourceType == ResourceType.Multiplier) value = (value + 100) / 100;
  else {
    const scale = getScale(resource);
    value = value / Number(scale);
    if (resourceType == ResourceType.ResourceRate) value = value * 60;
  }

  const label =
    formatNumber(value, { short: short && resourceType !== ResourceType.Multiplier, fractionDigits }) +
    suffixes[resourceType || ResourceType.Resource];

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
  const hasEnough = useHasEnoughOfResource(props.resource, props.amount, props.spaceRock, props.resourceType);
  return <ResourceIconTooltipContent {...props} hasEnough={hasEnough} />;
};

export const ResourceIconTooltip = (props: ResourceIconProps) => {
  if (props.validate) {
    return <ResourceIconTooltipValidate {...props} />;
  } else {
    return <ResourceIconTooltipContent {...props} hasEnough={true} />;
  }
};
