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
    <div className="w-full h-full bg-white/[.06] p-2">
      <div className="text-xs w-fit flex flex-col gap-2">
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <div className="col-span-1" />
          {units.map((unit, index) => (
            <div key={`unit-header-${index}`} className="text-center">
              <img
                src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
                alt={`${unit} icon`}
                className="w-8 h-8 mx-auto p-1"
              />
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <p className="font-bold text-left text-rose-500">Lost</p>
          {units.map((unit, index) => {
            const { casualties } = data[unit];
            return (
              <p key={`lost-${index}`} className="text-center text-rose-500">
                {casualties.toLocaleString()}
              </p>
            );
          })}
        </div>
        <div className={`grid grid-cols-${units.length + 1} gap-4`}>
          <p className="font-bold text-left">Remain</p>
          {units.map((unit, index) => {
            const { unitsAtStart, casualties } = data[unit];
            return (
              <p key={`remaining-${index}`} className="text-center">
                {(unitsAtStart - casualties).toLocaleString()}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};
