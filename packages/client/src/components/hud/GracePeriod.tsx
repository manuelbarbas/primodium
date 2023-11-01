import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { FaDove } from "react-icons/fa";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { useNow } from "src/util/time";
import { Hex } from "viem";
import { Tooltip } from "../core/Tooltip";
dayjs.extend(duration);

export const GracePeriod = () => {
  const playerEntity = useMud().network.playerEntity;
  const time = useNow();
  const endTime = components.GracePeriod.useWithKeys({ entity: playerEntity as Hex })?.value;
  if (!endTime) return null;
  const duration = dayjs.duration(Number(endTime - time) * 1000);

  if (time >= endTime) return null;

  return (
    <div className="flex flex-col items-center justify-center mt-2 space-y-1 drop-shadow-2xl pointer-events-auto">
      <Tooltip text="Grace Period" direction="bottom">
        <p className="text-sm text-success font-bold flex items-center gap-2">
          <FaDove /> {duration.format("mm [min] ss [sec]")}
        </p>
      </Tooltip>
    </div>
  );
};
