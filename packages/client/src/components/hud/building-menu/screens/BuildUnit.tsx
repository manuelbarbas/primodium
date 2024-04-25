import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { useEffect, useMemo, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { NumberInput } from "src/components/core/NumberInput";
import { useMud } from "src/hooks";
import { useMaxCountOfRecipe } from "src/hooks/useMaxCountOfRecipe";
import { components } from "src/network/components";
import { train } from "src/network/setup/contractCalls/train";
import { getEntityTypeName } from "src/util/common";
import { BackgroundImage, EntityType, ResourceEntityLookup, ResourceImage, UnitEnumLookup } from "src/util/constants";
import { formatNumber, formatResourceCount } from "src/util/number";
import { getRecipe } from "src/util/recipe";
import { getFullResourceCount } from "src/util/resource";
import { getUnitStats } from "src/util/unit";
import { Hex } from "viem";
import { ResourceIconTooltip } from "../../../shared/ResourceIconTooltip";
import { InterfaceIcons } from "@primodiumxyz/assets";

export const BuildUnit: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const [selectedUnit, setSelectedUnit] = useState<Entity>();

  const { P_UnitProdTypes, BuildingType, Level } = components;
  const activeRock = components.ActiveRock.use()?.value;
  if (!activeRock) throw new Error("[BuildUnit] No active rock selected");

  const buildingType = (BuildingType.get(building)?.value as Entity) ?? EntityType.NULL;
  const buildingLevel = Level.use(building)?.value ?? 1n;
  const trainableUnits = useMemo(() => {
    return (
      (P_UnitProdTypes.getWithKeys({ prototype: buildingType as Hex, level: buildingLevel })?.value as Entity[]) ?? []
    );
  }, [buildingType, buildingLevel, P_UnitProdTypes]);

  useEffect(() => {
    if (trainableUnits.length == 0) return;

    setSelectedUnit(trainableUnits[0]);
  }, [trainableUnits]);

  if (trainableUnits.length === 0) return null;

  return (
    <Navigator.Screen title="BuildUnit" className="relative flex flex-col w-full">
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
                    src={BackgroundImage.get(unit)?.at(0) ?? InterfaceIcons.Debug}
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
                {Object.entries(getUnitStats(selectedUnit, activeRock)).map(([name, value]) => {
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

              {selectedUnit && selectedUnit !== EntityType.ColonyShip && (
                <TrainNonColonyShip building={building} unit={selectedUnit} asteroid={activeRock} />
              )}
              {selectedUnit === EntityType.ColonyShip && <TrainColonyShip building={building} asteroid={activeRock} />}
            </>
          )}
        </div>
      </SecondaryCard>
    </Navigator.Screen>
  );
};

const TrainNonColonyShip = ({ building, unit, asteroid }: { building: Entity; unit: Entity; asteroid: Entity }) => {
  const [count, setCount] = useState("");

  useEffect(() => {
    setCount("");
  }, [unit]);

  const mud = useMud();
  const unitLevel = useMemo(() => {
    return components.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 1n;
  }, [unit, asteroid]);

  const recipe = useMemo(() => {
    return getRecipe(unit, unitLevel);
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
                image={ResourceImage.get(resource.id) ?? ""}
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

            train(mud, building, UnitEnumLookup[unit], BigInt(count));
          }}
        >
          Train
        </Navigator.BackButton>
        <Navigator.BackButton className="btn-sm border-secondary" />
      </div>
    </>
  );
};

const TrainColonyShip = ({ building, asteroid }: { building: Entity; asteroid: Entity }) => {
  const mud = useMud();
  const { playerAccount } = mud;
  const colonyShipResourceData = components.P_ColonyShipConfig.get();
  if (!colonyShipResourceData) throw new Error("No colony ship resource data found");
  const resource = ResourceEntityLookup[colonyShipResourceData.resource as EResource];

  const playerAsteroidsQuery = [
    Has(components.Asteroid),
    HasValue(components.OwnedBy, { value: playerAccount.entity as Hex }),
  ];

  const playerAsteroids = useEntityQuery(playerAsteroidsQuery);
  const ships = playerAsteroids.reduce((acc, entity) => {
    const data = getFullResourceCount(EntityType.ColonyShipCapacity, entity);
    return acc + data.resourceStorage - data.resourceCount;
  }, BigInt(playerAsteroids.length - 1));

  const cost = colonyShipResourceData.initialCost * 2n ** ships;

  return (
    <>
      <div className="flex justify-center items-center gap-1">COST</div>
      <Badge>
        <ResourceIconTooltip
          image={ResourceImage.get(resource) ?? ""}
          resource={resource}
          name={getEntityTypeName(resource)}
          amount={cost}
          fontSize="sm"
          validate
          spaceRock={asteroid}
        />
      </Badge>
      <hr className="border-t border-cyan-600 w-full" />

      <div className="flex gap-2 pt-5">
        <Navigator.BackButton
          className="btn-sm btn-secondary"
          onClick={() => {
            train(mud, building, UnitEnumLookup[EntityType.ColonyShip], 1n);
          }}
        >
          Train
        </Navigator.BackButton>
        <Navigator.BackButton className="btn-sm border-secondary" />
      </div>
    </>
  );
};
