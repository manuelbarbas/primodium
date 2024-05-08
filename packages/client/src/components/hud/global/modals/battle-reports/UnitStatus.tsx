import { EntityToUnitImage } from "@/util/mappings";
import { InterfaceIcons } from "@primodiumxyz/assets";
import React from "react";

interface UnitData {
  level: bigint;
  unitsAtStart: bigint;
  casualties: bigint;
}

interface UnitStatusProps {
  data: Record<string, UnitData>;
}

export const UnitStatus: React.FC<UnitStatusProps> = ({ data }) => {
  const units = Object.keys(data);

  return (
    <div className="h-full overflow-x-auto hide-scrollbar bg-glass p-2 flex flex-row items-center text-xs">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-8" />
        <p className="font-bold text-left text-error">Lost</p>
        <p className="font-bold text-left">Remain</p>
      </div>
      {units.map((unit, index) => {
        const { casualties, unitsAtStart } = data[unit];
        return (
          <div key={`unit-${index}`} className="flex flex-col items-center min-w-14 gap-2">
            <img src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug} alt={`${unit} icon`} className="w-8 h-8" />
            <p className="text-center text-error">{casualties.toLocaleString()}</p>
            <p className="text-center">{(unitsAtStart - casualties).toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
};
