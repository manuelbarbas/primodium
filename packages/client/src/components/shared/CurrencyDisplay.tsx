import { useMemo } from "react";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { formatNumber, weiToEth, weiToGwei } from "src/util/common";
import { Button } from "../core/Button";
import { toast } from "react-toastify";

export const CurrencyDisplay: React.FC<{
  wei: bigint;
  className?: string;
  options?: Parameters<typeof formatNumber>[1];
}> = ({ wei, className, options }) => {
  const [unitDisplay, toggleUnitDisplay] = useSettingsStore((state) => [state.unitDisplay, state.toggleUnitDisplay]);

  const val = useMemo(() => {
    let val = 0;
    if (unitDisplay === "ether") val = Number(weiToEth(wei));
    else val = Number(weiToGwei(wei));

    return formatNumber(val, { short: unitDisplay !== "ether", fractionDigits: 9, ...options });
  }, [wei, unitDisplay, options]);

  return (
    <Button
      onClick={() => {
        toggleUnitDisplay();
        toast.info("Changed currency display to" + (unitDisplay === "ether" ? " GWEI" : " wETH"));
      }}
      className={`${className} btn-xs !p-0 btn-ghost border-0 inline`}
    >
      {val}
    </Button>
  );
};
