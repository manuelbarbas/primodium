import { IconLabel } from "src/components/core/IconLabel";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";

export const HangarContent = () => {
  const activeRock = components.ActiveRock.use()?.value;
  const hangar = components.Hangar.use(activeRock);
  return (
    <div className="flex flex-col p-2 text-sm">
      {(!hangar || !hangar.units || hangar.units.length === 0) && (
        <p className="text-xs opacity-50 text-center"> NO UNITS</p>
      )}
      {hangar?.units?.map((unit, i) => (
        <div key={`unit-${i}`} className="flex gap-2 items-center">
          <IconLabel imageUri={ResourceImage.get(unit) ?? ""} className="text-xs" />
          <p>{formatResourceCount(unit, hangar.counts[i])}</p>
          <p className="opacity-50 text-xs">{getBlockTypeName(unit)}</p>
        </div>
      ))}
    </div>
  );
};
