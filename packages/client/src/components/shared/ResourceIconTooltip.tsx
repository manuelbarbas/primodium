import { formatNumber } from "src/util/common";
import { RESOURCE_SCALE } from "src/util/constants";

export default function ResourceIconTooltip({
  image,
  resourceId,
  name,
  amount,
  inline,
  scale = RESOURCE_SCALE,
  fontSize = "md",
}: {
  image: string;
  resourceId: string;
  name: string;
  amount: number;
  inline?: boolean;
  scale?: number;
  fontSize?: string;
}) {
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

  if (inline) {
    return (
      <div className={`group inline-block text-${fontSize}`}>
        <div className="resource-tooltip group-hover:scale-100">
          {formatString(name)}
        </div>
        <div>
          <img className="inline-block mr-1" src={image}></img>
          {formatNumber(amount * scale)}
        </div>
      </div>
    );
  }

  return (
    <div className={`group text-${fontSize}`}>
      <div className="resource-tooltip group-hover:scale-100">
        {formatString(name)}
      </div>
      <div key={resourceId}>
        <img src={image} className="w-4 h-4 inline-block mr-1 pixel-images" />
        {formatNumber(amount * scale)}
      </div>
    </div>
  );
}
