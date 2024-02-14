import { formatNumber } from "src/util/number";
import { Tooltip } from "../core/Tooltip";

type Props = {
  imgUrl?: string;
  health: number;
  hideValue?: boolean;
  maxHealth?: number;
  className?: string;
  tooltipContent?: string;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
};
export const HealthBar: React.FC<Props> = ({
  tooltipContent,
  tooltipDirection,
  imgUrl,
  health,
  maxHealth = 100,
  hideValue,
  className,
}) => {
  const getBarColor = (): string => {
    if (health > 66) return "bg-success";
    if (health > 33) return "bg-warning";
    return "bg-error";
  };

  return (
    <Tooltip text={tooltipContent} direction={tooltipDirection} className="text-xs">
      <div className={`flex gap-1 items-center justify-center pointer-events-auto w-full ${className}`}>
        {!hideValue && (
          <p className="flex text-xs justify-between font-bold text-accent w-24 items-center">
            {imgUrl && <img src={imgUrl} className="w-3 h-3 mr-1" alt="health" />}
            {formatNumber(health, { short: true })}
          </p>
        )}

        <div className="w-full bg-slate-700 h-2">
          <div
            className={`h-2 ${getBarColor()} animate transition-width duration-300 opacity-80`}
            style={{ width: `${Math.min(maxHealth, health)}%` }}
          ></div>
        </div>
      </div>
    </Tooltip>
  );
};
