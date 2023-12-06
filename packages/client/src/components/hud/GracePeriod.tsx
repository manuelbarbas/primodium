import { Entity } from "@latticexyz/recs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { components } from "src/network/components";
import { Hex } from "viem";
import { IconLabel } from "../core/IconLabel";
dayjs.extend(duration);

export const GracePeriod: React.FC<{ player: Entity }> = ({ player }) => {
  const time = components.Time.use()?.value ?? 0n;
  const endTime = components.GracePeriod.useWithKeys({ entity: player as Hex })?.value;
  if (!endTime) return null;
  const duration = dayjs.duration(Number(endTime - time) * 1000);

  if (time >= endTime) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-1 drop-shadow-2xl pointer-events-auto ${className}`}
    >
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
