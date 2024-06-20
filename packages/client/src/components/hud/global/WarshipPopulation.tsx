import { Tooltip } from "@/components/core/Tooltip";
import { HealthBar } from "@/components/shared/HealthBar";
import { AccountDisplay } from "@/components/shared/AccountDisplay";
import { useMemo } from "react";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { formatNumber } from "@primodiumxyz/core";
import { bigIntMin } from "@latticexyz/common/utils";

export const WarshipPopulation = () => {
  const { tables } = useCore();
  const { unitDeaths, gameOver } = tables.VictoryStatus.use() ?? { unitDeaths: 0n, gameOver: false };
  const unitDeathLimit = tables.P_GameConfig.use()?.unitDeathLimit ?? 0n;
  const playerEntity = useAccountClient().playerAccount.entity;

  const TooltipContent: React.FC = () => {
    if (unitDeathLimit === 0n) return null;
    return (
      <div className="flex flex-col w-96 gap-1">
        <p>
          Warship Casualties: {formatNumber(bigIntMin(unitDeaths, unitDeathLimit))} / {formatNumber(unitDeathLimit)}
        </p>
        <HealthBar health={Number(unitDeaths)} maxHealth={Number(unitDeathLimit)} hideValue />

        <p className="opacity-70 pt-2 text-center text-wrap">
          {gameOver
            ? "The connect to the belt has closed. Nobody can earn anymore points. Good game!"
            : `Once warship casualties of all players reach ${formatNumber(unitDeathLimit, {
                short: true,
              })}, Star Command will close the rift to the belt, ending the round.`}
        </p>
      </div>
    );
  };

  const color = useMemo(() => {
    if (gameOver || unitDeathLimit === 0n) return "text-error";
    const pct = (100n * unitDeaths) / unitDeathLimit;
    if (pct < 70) return "text-success";
    if (pct < 90) return "text-warning";
    return "text-error";
  }, [gameOver, unitDeathLimit, unitDeaths]);

  if (unitDeathLimit === 0n) return null;
  return (
    <div className="font-bold uppercase p-6 flex flex-col gap-5">
      <div>
        ID: <AccountDisplay noColor player={playerEntity} className="text-sm" />
      </div>
      {gameOver ? (
        <p>Game Over</p>
      ) : (
        <div className="pointer-events-auto">
          <Tooltip tooltipContent={<TooltipContent />} direction="center">
            <p className="flex inline gap-2">
              Warship Casualties:{" "}
              <span className={color}>{((100n * unitDeaths) / unitDeathLimit).toLocaleString()}%</span>
            </p>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
