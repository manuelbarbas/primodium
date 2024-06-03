import { Tooltip } from "@/components/core/Tooltip";
import { HealthBar } from "@/components/shared/HealthBar";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { useMud } from "@/hooks";
import { formatNumber } from "@/util/number";
import { useMemo } from "react";
import { components } from "src/network/components";

export const WarshipPopulation = () => {
  const { unitDeaths, gameOver } = components.VictoryStatus.use() ?? { unitDeaths: 0n, gameOver: false };
  const unitDeathLimit = components.P_GameConfig.use()?.unitDeathLimit ?? 0n;
  const playerEntity = useMud().playerAccount.entity;

  const TooltipContent: React.FC = () => {
    return (
      <div className="flex flex-col w-96 gap-1">
        <p>
          Warship Casualties: {formatNumber(unitDeaths)} / {formatNumber(unitDeathLimit)}
        </p>
        <HealthBar health={Number(unitDeaths)} maxHealth={Number(unitDeathLimit)} hideValue />
        <p className="opacity-70 pt-2 text-center text-wrap">
          {gameOver
            ? "The connect to the belt has closed. Game Over."
            : `Once warship casualties of all players reach ${formatNumber(unitDeathLimit, {
                short: true,
              })}, Star Command will close the rift to the belt, ending the round.`}
        </p>
      </div>
    );
  };

  const color = useMemo(() => {
    if (gameOver) return "text-error";
    const pct = (100n * unitDeaths) / unitDeathLimit;
    if (pct < 70) return "text-success";
    if (pct < 90) return "text-warning";
    return "text-error";
  }, [gameOver, unitDeathLimit, unitDeaths]);

  return (
    <div className="font-bold uppercase p-6 flex flex-col 2xl:flex-row gap-5">
      <div>
        ID: <AccountDisplay noColor player={playerEntity} className="text-sm" />
      </div>
      <p className="hidden 2xl:block opacity-50">|</p>
      {gameOver ? (
        <p>Game Over</p>
      ) : (
        <div className="pointer-events-auto">
          <Tooltip tooltipContent={<TooltipContent />} direction="center">
            <p className="flex gap-2">
              Warship Casualties:{" "}
              <span className={color}>{((100n * unitDeaths) / unitDeathLimit).toLocaleString()}%</span>
            </p>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
