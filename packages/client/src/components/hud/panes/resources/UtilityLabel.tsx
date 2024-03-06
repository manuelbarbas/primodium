import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";

export const UtilityLabel = ({
  name,
  resourceId,
  asteroid,
  showCount,
}: {
  name: string;
  resourceId: Entity;
  asteroid: Entity;
  showCount?: boolean;
}) => {
  const { resourceCount, resourceStorage } = useFullResourceCount(resourceId, asteroid);

  const used = resourceStorage - resourceCount;
  const resourceIcon = ResourceImage.get(resourceId);

  return (
    <Badge className="w-full flex justify-start">
      <IconLabel
        tooltipText={name}
        tooltipDirection="top"
        imageUri={resourceIcon ?? ""}
        text={formatResourceCount(resourceId, showCount ? resourceCount : used)}
        className="mr-1"
      />
      <b className={`text-accent text-xs opacity-50`}>/{formatResourceCount(resourceId, resourceStorage)}</b>
    </Badge>
  );
};
