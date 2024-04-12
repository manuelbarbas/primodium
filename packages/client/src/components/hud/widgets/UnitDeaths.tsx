import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { HealthBar } from "../HealthBar";

export const UnitDeaths = () => {
  const { unitDeaths, gameOver } = components.VictoryStatus.use() ?? { unitDeaths: 0n, gameOver: false };
  const unitDeathLimit = components.P_GameConfig.use()?.unitDeathLimit ?? 0n;
  const primodium = usePrimodium();
  const input = primodium.api("UI").input;
  const input2 = primodium.api("ASTEROID").input;
  const input3 = primodium.api("STARMAP").input;

  return (
    <div
      className="font-mono min-w-[200px]"
      onMouseEnter={() => {
        input.disableInput();
        input2.disableInput();
        input3.disableInput();
      }}
      onMouseLeave={() => {
        input.enableInput();
        input2.enableInput();
        input3.enableInput();
      }}
    >
      {gameOver ? (
        "Game Over!"
      ) : (
        <>
          Unit Deaths: {unitDeaths.toLocaleString()} / {unitDeathLimit.toLocaleString()}
          <HealthBar health={Number(unitDeaths)} maxHealth={Number(unitDeathLimit)} />
        </>
      )}
    </div>
  );
};
