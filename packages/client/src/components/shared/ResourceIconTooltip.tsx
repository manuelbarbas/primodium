import { EntityID } from "@latticexyz/recs";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";
import { BlockNumber } from "src/network/components/clientComponents";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceType } from "src/util/constants";
import { IconLabel } from "../core/IconLabel";
import { Tooltip } from "../core/Tooltip";

export default function ResourceIconTooltip({
  image,
  resourceId,
  name,
  amount,
  scale = RESOURCE_SCALE,
  fontSize = "md",
  resourceType = ResourceType.Resource,
  validate = true,
  direction = "right",
}: {
  image: string;
  resourceId: EntityID;
  resourceType?: ResourceType;
  name: string;
  amount: number;
  inline?: boolean;
  scale?: number;
  fontSize?: string;
  validate?: boolean;
  direction?: "top" | "bottom" | "right" | "left";
}) {
  const hasEnough = useHasEnoughOfResource(resourceId, amount, resourceType);
  const { avgBlockTime } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const label =
    ResourceType.ResourceRate !== resourceType
      ? amount * scale !== 0
        ? formatNumber(amount * scale, 0)
        : "--"
      : `${formatNumber((amount * scale * 60) / avgBlockTime, 1)}/MIN`;

  return (
    <Tooltip text={name} direction={direction}>
      <IconLabel
        imageUri={image}
        text={label}
        className={`text-${fontSize} font-bold ${
          !hasEnough && validate ? `text-error animate-pulse ` : ""
        }
        `}
      />
    </Tooltip>
  );
}
