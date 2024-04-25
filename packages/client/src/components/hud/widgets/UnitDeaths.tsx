import { Tooltip } from "@/components/core/Tooltip";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { useMud } from "@/hooks";
import { formatNumber } from "@/util/number";
import { components } from "src/network/components";

export const UnitDeaths = () => {
  const { unitDeaths, gameOver } = components.VictoryStatus.use() ?? { unitDeaths: 0n, gameOver: false };
  const unitDeathLimit = components.P_GameConfig.use()?.unitDeathLimit ?? 0n;
  const playerEntity = useMud().playerAccount.entity;
  const tooltipContent = `${formatNumber(unitDeaths, { showZero: true })} / ${formatNumber(unitDeathLimit, {
    short: true,
  })}`;

  return (
    <div className="font-bold uppercase p-6 flex gap-10">
      <div>
        ID: <AccountDisplay noColor player={playerEntity} className="text-sm" />
      </div>
      {gameOver ? (
        <p>Game Over</p>
      ) : (
        <span className="pointer-events-auto">
          <Tooltip tooltipContent={tooltipContent} direction="bottom">
            <p className="flex inline gap-2">
              Unit Deaths: <p className="text-secondary">{(unitDeaths / unitDeathLimit).toLocaleString()}%</p>
            </p>
          </Tooltip>
        </span>
      )}
    </div>
  );
};
