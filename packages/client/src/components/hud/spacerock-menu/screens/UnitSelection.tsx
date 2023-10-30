import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { getBlockTypeName } from "src/util/common";
import { BackgroundImage } from "src/util/constants";
import { getUnitStats } from "src/util/trainUnits";

export const UnitSelection = () => {
  const playerEntity = useMud().network.playerEntity;
  const origin = components.Send.get()?.origin;
  const [selectedUnit, setSelectedUnit] = useState<Entity>();
  const [count, setCount] = useState(1);
  const { units, counts } = components.Hangar.use(origin, {
    units: [],
    counts: [],
  });

  const unitCount = useMemo(() => {
    if (!units) return 0;
    const index = units.indexOf(selectedUnit ?? singletonEntity);
    if (index === -1) return 0;
    return counts[index];
  }, [selectedUnit, units, counts]);

  return (
    <Navigator.Screen title="UnitSelection">
      <SecondaryCard className="pixel-images w-full pointer-events-auto">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {units.map((unit, index) => {
              return (
                <button
                  key={index}
                  className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                  onClick={() => (selectedUnit == unit ? setSelectedUnit(undefined) : setSelectedUnit(unit))}
                >
                  <img
                    src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
                    className={`border w-[64px] h-[64px] group-hover:opacity-50 rounded-xl ${
                      selectedUnit == unit ? "border-2 border-accent" : "border-secondary/75"
                    }`}
                  />
                  <p className="opacity-0 absolute -bottom-4 text-xs bg-error rounded-box px-1 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    {getBlockTypeName(unit)}
                  </p>
                </button>
              );
            })}
          </div>
          <hr className="border-t border-cyan-600 w-full" />
          {!selectedUnit ? (
            <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
              <FaInfoCircle size={16} /> Select a unit to start building drones.
            </p>
          ) : (
            <>
              <p className="uppercase font-bold">{getBlockTypeName(selectedUnit)}</p>

              <div className="grid grid-cols-5 gap-2 border-y border-cyan-400/30">
                {Object.entries(getUnitStats(selectedUnit, playerEntity)).map(([name, value]) => (
                  <div key={name} className="flex flex-col items-center">
                    <p className="text-xs opacity-50">{name}</p>
                    <p>{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <hr className="border-t border-cyan-600 w-full" />

              <NumberInput min={1} max={Number(unitCount)} onChange={(val) => setCount(val)} />

              <div className="flex gap-2">
                <Navigator.BackButton
                  className="btn-sm btn-secondary"
                  onClick={() => {
                    components.Send.setUnitCount(selectedUnit, BigInt(count));
                  }}
                >
                  Add to fleet
                </Navigator.BackButton>
                <Navigator.BackButton className="btn-sm border-secondary" />
              </div>
              <p className="opacity-50 text-xs">{Math.max(Number(unitCount) - count, 0)} units left</p>
            </>
          )}
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
