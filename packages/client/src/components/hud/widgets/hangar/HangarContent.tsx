import { Entity } from "@latticexyz/recs";
import { IconLabel } from "src/components/core/IconLabel";
import { components } from "src/network/components";
import { getEntityTypeName } from "src/util/common";
import { ResourceImage } from "src/util/constants";
import { formatResourceCount } from "src/util/number";
import { Hex } from "viem";
import { toRomanNumeral } from "src/util/common";

export const HangarContent = () => {
  const activeRock = components.ActiveRock.use()?.value;
  const hangar = components.Hangar.use(activeRock);
  if (!activeRock) return null;
  return (
    <div className="flex flex-col p-2 text-sm">
      {(!hangar || !hangar.units || hangar.units.length === 0) && (
        <p className="text-xs opacity-50 text-center"> NO UNITS</p>
      )}
      {hangar?.units?.map((unit, i) => (
        <div key={`unit-${i}`} className="flex gap-2 items-center">
          <IconLabel imageUri={ResourceImage.get(unit) ?? ""} className="text-xs" />
          <p>{formatResourceCount(unit, hangar.counts[i])}</p>
          <p className="opacity-50 text-xs">{getEntityTypeName(unit)}</p>
        </div>
      ))}
    </div>
  );
};

export const Unit = ({ unit, asteroid, className = "" }: { unit: Entity; asteroid: Entity; className?: string }) => {
  const level = components.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
  return (
    <p className={className}>
      {getEntityTypeName(unit)} {toRomanNumeral(Number(level + 1n))}
    </p>
  );
};
