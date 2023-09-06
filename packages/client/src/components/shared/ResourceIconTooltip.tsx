import { EntityID } from "@latticexyz/recs";
import { useHasEnoughOfResource } from "src/hooks/useHasEnoughOfResource";
import { BlockNumber } from "src/network/components/clientComponents";
import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE, ResourceType } from "src/util/constants";

export default function ResourceIconTooltip({
  image,
  resourceId,
  name,
  amount,
  inline,
  scale = RESOURCE_SCALE,
  fontSize = "md",
  resourceType = ResourceType.Resource,
}: {
  image: string;
  resourceId: EntityID;
  resourceType?: ResourceType;
  name: string;
  amount: number;
  inline?: boolean;
  scale?: number;
  fontSize?: string;
}) {
  const hasEnough = useHasEnoughOfResource(resourceId, amount, resourceType);
  const { avgBlockTime } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  function formatString(str: string) {
    // remove ending "Crafted" or "Resource"
    if (str.endsWith("Crafted")) {
      str = str.substring(0, str.length - 7);
    } else if (str.endsWith("Resource")) {
      str = str.substring(0, str.length - 8);
    }
    // change CamelCase to "Camel Case"
    str = str.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    return str;
  }

  return (
    <div className={`group text-${fontSize} ${inline ? "inline-block" : ""}`}>
      <div className="resource-tooltip group-hover:scale-100">
        {formatString(name)}
      </div>
      <div key={resourceId} className="flex items-center">
        <img src={image} className="w-4 h-4 inline-block mr-1 pixel-images" />
        {ResourceType.ResourceRate !== resourceType && (
          <p className={`${hasEnough ? "" : "text-rose-500 animate-pulse"}`}>
            {formatNumber(amount * scale)}
          </p>
        )}
        {ResourceType.ResourceRate === resourceType && (
          <p className={`${hasEnough ? "" : "text-rose-500 animate-pulse"}`}>
            {formatNumber((amount * scale * 60) / avgBlockTime)}/MIN
          </p>
        )}
      </div>
    </div>
  );
}
