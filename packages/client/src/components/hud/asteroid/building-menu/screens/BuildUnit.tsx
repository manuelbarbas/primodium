import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Hex } from "viem";

import { InterfaceIcons } from "@primodiumxyz/assets";
import { EntityType, formatNumber, formatResourceCount, getEntityTypeName, UnitEnumLookup } from "@primodiumxyz/core";
import { useCore, useMaxCountOfRecipe } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { Badge } from "@/components/core/Badge";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { NumberInput } from "@/components/core/NumberInput";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { useContractCalls } from "@/hooks/useContractCalls";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/image";

export const BuildUnit: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const [selectedUnit, setSelectedUnit] = useState<Entity>();

  const { tables, utils } = useCore();
  const { P_UnitProdTypes, BuildingType, Level } = tables;
  const activeRock = tables.ActiveRock.use()?.value ?? tables.ActiveRock.get()?.value;
  if (!activeRock) throw new Error("[BuildUnit] No active rock selected");

  const buildingType = (BuildingType.get(building)?.value as Entity) ?? EntityType.NULL;
  const buildingLevel = Level.use(building)?.value ?? 1n;
  const trainableUnits = useMemo(() => {
    return (P_UnitProdTypes.getWithKeys({ prototype: buildingType, level: buildingLevel })?.value as Entity[]) ?? [];
  }, [buildingType, buildingLevel, P_UnitProdTypes]);

  useEffect(() => {
    if (trainableUnits.length == 0) return;

    setSelectedUnit(trainableUnits[0]);
  }, [trainableUnits]);

  if (trainableUnits.length === 0) return null;

  return (
    <Navigator.Screen title="BuildUnit" className="relative flex flex-col !w-96">
      <SecondaryCard className="pixel-images w-full pointer-events-auto">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {trainableUnits.map((unit, index) => {
              return (
                <button
                  key={index}
                  className="relative flex flex-col items-center group hover:scale-110 transition-transform hover:z-50"
                  onClick={() => (selectedUnit == unit ? setSelectedUnit(undefined) : setSelectedUnit(unit))}
                >
                  <img
                    src={EntityToUnitImage[unit] ?? InterfaceIcons.Debug}
                    className={`border w-[72px] p-2 group-hover:opacity-50 bg-neutral ${
                      selectedUnit == unit ? "border-2 border-accent" : "border-secondary/75"
                    }`}
                  />
                  <p className="opacity-0 absolute -bottom-4 text-xs bg-error rounded-box px-1 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                    {getEntityTypeName(unit)}
                  </p>
                </button>
              );
            })}
          </div>
          <hr className="border-t border-cyan-600 w-full" />
          {!selectedUnit ? (
            <p className="opacity-50 text-xs italic mb-2 flex gap-2 z-10">
              <FaInfoCircle size={16} /> Select a unit to start building drones!
            </p>
          ) : (
            <>
              <p className="uppercase font-bold">{getEntityTypeName(selectedUnit)}</p>

              <div className="grid grid-cols-6 gap-2 border-y border-cyan-400/30 mx-auto">
                {Object.entries(utils.getUnitStats(selectedUnit, activeRock)).map(([name, value]) => {
                  return (
                    <div key={name} className="flex flex-col items-center">
                      <p className="text-xs opacity-50">{name}</p>
                      <p>
                        {["SPD"].includes(name) ? formatNumber(value) : formatResourceCount(EntityType.Iron, value)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedUnit && <TrainShip building={building} unit={selectedUnit} asteroid={activeRock} />}
            </>
          )}
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};

const TrainShip = ({ building, unit, asteroid }: { building: Entity; unit: Entity; asteroid: Entity }) => {
  const [count, setCount] = useState("");
  const { tables, utils } = useCore();
  const { train } = useContractCalls();

  useEffect(() => {
    setCount("");
  }, [unit]);

  const unitLevel = useMemo(() => {
    return tables.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 1n;
  }, [unit, asteroid]);

  const recipe = useMemo(() => {
    return utils.getRecipe(unit, unitLevel);
  }, [unit, unitLevel]);

  const maximum = useMaxCountOfRecipe(recipe, asteroid);
  return (
    <>
      <p className="text-sm leading-none opacity-75">COST</p>

      {recipe && (
        <div className="flex justify-center items-center gap-1">
          {recipe.map((resource, i) => (
            <Badge key={`resource-${i}`}>
              <ResourceIconTooltip
                image={EntityToResourceImage[resource.id]}
                resource={resource.id}
                name={getEntityTypeName(resource.id)}
                amount={resource.amount * BigInt(count)}
                fontSize="sm"
                validate
                spaceRock={asteroid}
              />
            </Badge>
          ))}
        </div>
      )}

      <hr className="border-t border-cyan-600 w-full" />

      <NumberInput max={maximum} count={count} onChange={(val) => setCount(val)} />
      <div className="flex gap-2 pt-5">
        <Navigator.BackButton
          className="btn-sm btn-secondary"
          disabled={maximum < Number(count) || count == ""}
          onClick={() => {
            if (!unit) return;

            train(building, UnitEnumLookup[unit], BigInt(count));
          }}
        >
          Train
        </Navigator.BackButton>
        <Navigator.BackButton className="btn-sm border-secondary" />
      </div>
    </>
  );
};
