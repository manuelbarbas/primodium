import { Entity } from "@latticexyz/recs";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceType } from "src/util/constants";
import { IconLabel } from "../core/IconLabel";

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

const suffixes = {
  [ResourceType.Utility]: "",
  [ResourceType.ResourceRate]: "/MIN",
  [ResourceType.Resource]: "",
  [ResourceType.Multiplier]: "X",
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
  const value = ResourceType.ResourceRate == resourceType ? Number((amount * 60n) / scale) : Number(amount / scale);
  const label = formatNumber(value) + suffixes[resourceType || ResourceType.Resource];

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
