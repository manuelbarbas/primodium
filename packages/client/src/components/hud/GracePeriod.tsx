import { Entity } from "@latticexyz/recs";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { formatTime } from "src/util/number";
import { IconLabel } from "../core/IconLabel";

export const GracePeriod: React.FC<{ entity: Entity; className?: string }> = ({ entity, className }) => {
  const { inGracePeriod, duration } = useInGracePeriod(entity);

  if (!inGracePeriod) return null;
  return (
    <div className={`flex flex-col items-center justify-center space-y-1 pointer-events-auto ${className}`}>
      <div className="flex gap-2 items-center">
        <IconLabel imageUri="img/icons/graceicon.png" tooltipText="Grace Period" />
        {formatTime(duration)}
      </div>
    </div>
  );
};
