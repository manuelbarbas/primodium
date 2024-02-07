import { Entity } from "@latticexyz/recs";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { IconLabel } from "../core/IconLabel";

export const GracePeriod: React.FC<{ player: Entity; className?: string }> = ({ player, className }) => {
  const { inGracePeriod, duration } = useInGracePeriod(player);

  if (!inGracePeriod) return null;
  return (
    <div className={`flex flex-col items-center justify-center space-y-1 pointer-events-auto ${className}`}>
      <div className="flex gap-2 items-center">
        <IconLabel imageUri="img/icons/graceicon.png" tooltipText="Grace Period" />
        {duration.minutes() !== 0 && (
          <p className="">
            {duration.asHours().toFixed()} hrs {duration.minutes()} min
          </p>
        )}
        {duration.asMinutes() === 0 && <p className="">{duration.seconds()} sec</p>}
      </div>
    </div>
  );
};
