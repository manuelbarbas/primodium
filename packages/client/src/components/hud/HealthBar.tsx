import { formatNumber } from "src/util/number";
import { Tooltip } from "../core/Tooltip";

type Props = {
  imgUrl?: string;
  health: number;
  hideValue?: boolean;
  maxHealth?: number;
  className?: string;
  tooltipText?: string;
};
export const HealthBar: React.FC<Props> = ({ imgUrl, health, maxHealth = 100, hideValue, className, tooltipText }) => {
  const getBarColor = (): string => {
    if (health / maxHealth > 0.66) return "bg-success";
    if (health / maxHealth > 0.33) return "bg-warning";
    return "bg-error";
  };

  return (
    <Tooltip tooltipContent={tooltipText} direction="top">
      <div className={`flex gap-1 text-xs items-center justify-center pointer-events-auto w-full ${className}`}>
        {!hideValue && (
          <>
            {imgUrl && <img src={imgUrl} className="w-4 h-4" alt="health" />}
            {formatNumber(health, { short: true, showZero: true })}
          </>
        )}

        <div className="w-full bg-slate-700 h-2">
          <div
            className={`h-2 ${getBarColor()} animate transition-width duration-300 opacity-80`}
            style={{ width: `${maxHealth == 0 ? 0 : Math.min(100, (100 * health) / maxHealth)}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
