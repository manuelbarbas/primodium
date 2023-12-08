import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";
import { formatNumber } from "src/util/common";

export const StationedUnitsLabel = () => {
  const selectedAsteroid = components.SelectedRock.use()?.value;
  const unitCounts = components.Hangar.use(selectedAsteroid ?? singletonEntity)?.counts ?? [];

  const count = unitCounts.reduce((acc, count) => acc + count, 0n);

  return (
    <div className="absolute top-0 right-0 flex flex-col items-center gap-1">
      <SecondaryCard className="flex flex-row items-center rounded-r-none border-t-0">
        <p className="font-bold uppercase text-sm">
          {formatNumber(count, {
            short: true,
          })}{" "}
          STATIONED
        </p>
      </SecondaryCard>
      <p className="text-xs opacity-75 font-bold"># UNITS</p>
    </div>
  );
};
