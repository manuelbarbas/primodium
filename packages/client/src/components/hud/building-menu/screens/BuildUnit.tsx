import { BackgroundImage, EntityType, RESOURCE_SCALE, ResourceImage, ResourceType } from "src/util/constants";
import { getBlockTypeName } from "src/util/common";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Entity } from "@latticexyz/recs";
import { useMud } from "src/hooks";
import { Hex } from "viem";
import { getUnitStats } from "src/util/trainUnits";
import { ResourceIconTooltip } from "../../../shared/ResourceIconTooltip";
import { NumberInput } from "src/components/shared/NumberInput";
import { getRecipe } from "src/util/resource";
import { Navigator } from "src/components/core/Navigator";
import { SecondaryCard } from "src/components/core/Card";
import { Badge } from "src/components/core/Badge";
import { components } from "src/network/components";
import { useMaxCountOfRecipe } from "src/hooks/useMaxCountOfRecipe";

export const BuildUnit: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const mud = useMud();
  const [selectedUnit, setSelectedUnit] = useState<Entity>();
  const [count, setCount] = useState(1);
  const playerEntity = mud.network.playerEntity;
  const trainableUnits = [EntityType.AnvilLightDrone, EntityType.HammerLightDrone, EntityType.StingerDrone];

  const { UnitLevel } = components;

  useEffect(() => {
    setCount(1);
  }, [selectedUnit]);

  const unitLevel = useMemo(() => {
    if (!selectedUnit) return 1n;

    return UnitLevel.getWithKeys({ entity: playerEntity as Hex, unit: selectedUnit as Hex })?.value ?? 1n;
  }, [selectedUnit, UnitLevel, playerEntity]);

  const requiredResources = useMemo(() => {
    return getRecipe(selectedUnit ?? EntityType.NULL, unitLevel);
  }, [selectedUnit, unitLevel]);

  const maximum = useMaxCountOfRecipe(requiredResources, playerEntity);

  useEffect(() => {
    if (trainableUnits.length == 0) return;

    setSelectedUnit(trainableUnits[0]);
  }, []);

  if (trainableUnits.length === 0) return null;

  return (
    <Navigator.Screen title="BuildUnit" className="relative flex flex-col  items-center text-white w-96">
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

              <p className="text-sm leading-none opacity-75">COST</p>

              {requiredResources && (
                <div className="flex justify-center items-center gap-1">
                  {requiredResources.map((resource, i) => (
                    <Badge key={`resource-${i}`}>
                      <ResourceIconTooltip
                        image={ResourceImage.get(resource.id) ?? ""}
                        playerEntity={playerEntity}
                        resource={resource.id}
                        name={getBlockTypeName(resource.id)}
                        amount={resource.amount * BigInt(count)}
                        scale={ResourceType.Utility === resource.type ? 1n : RESOURCE_SCALE}
                        fontSize="sm"
                        validate
                      />
                    </Badge>
                  ))}
                </div>
              )}

              <hr className="border-t border-cyan-600 w-full" />

              <NumberInput min={1} max={maximum} onChange={(val) => setCount(val)} />

              <div className="flex gap-2">
                <Navigator.BackButton
                  className="btn-sm btn-secondary"
                  disabled={maximum < count || count < 1}
                  onClick={() => {
                    // train(building, selectedUnit, count, network);
                  }}
                >
                  Train
                </Navigator.BackButton>
                <Navigator.BackButton className="btn-sm border-secondary" />
              </div>
            </>
          )}
          {/* <p className="opacity-50 text-xs">{Math.max(maximum - unitsTaken, 0)} housing left</p> */}
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};
