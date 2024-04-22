import { Entity } from "@latticexyz/recs";
import { useEffect, useMemo } from "react";
import { FaLock } from "react-icons/fa";
import { usePersistentStore } from "src/game/stores/PersistentStore";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { Action, EntityType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
import { Button } from "../../../core/Button";
import { BuildingImageFromType } from "../../../shared/BuildingImage";
import { getBuildingDimensions } from "src/util/building";
import { useShallow } from "zustand/react/shallow";
import { KeyNames, KeybindActionKeys } from "@game/lib/constants/keybinds";

const BlueprintButton: React.FC<{
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
  keybind?: KeybindActionKeys;
  keybindActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ buildingType, tooltipDirection, keybind, keybindActive = true, style }) => {
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = usePrimodium().api("ASTEROID");
  const [hideHotkeys] = usePersistentStore(useShallow((state) => [state.hideHotkeys]));
  const keybinds = useKeybinds();
  const selectedRockEntity = components.ActiveRock.use()?.value as Entity | undefined;
  if (!selectedRockEntity) throw new Error("No active rock entity found");
  const rockMainBase = components.Home.use(selectedRockEntity)?.value;
  const selectedBuilding = components.SelectedBuilding.use()?.value;
  const mainbaseLevel = components.Level.use(rockMainBase as Entity)?.value ?? 1n;
  const levelRequirement =
    components.P_RequiredBaseLevel.getWithKeys({ prototype: buildingType as Hex, level: 1n })?.value ?? 1n;
  const hasMainbaseLevel = mainbaseLevel >= levelRequirement;

  const hasEnough = useHasEnoughResources(getRecipe(buildingType, 1n), selectedRockEntity);

  useEffect(() => {
    if (!keybindActive || !keybind) return;

    const key = addListener(keybind, () => {
      if (selectedBuilding === buildingType) {
        components.SelectedBuilding.remove();
        components.SelectedAction.remove();
        return;
      }

      components.SelectedBuilding.set({ value: buildingType });
    });

    return () => key.dispose();
  }, [keybind, keybindActive, buildingType, selectedBuilding, addListener]);

  return (
    <Button
      className={`hover:scale-110 drop-shadow-hard`}
      variant={buildingType === selectedBuilding ? "warning" : "ghost"}
      disabled={mainbaseLevel < levelRequirement}
      keybind={keybindActive ? keybind : undefined}
      tooltipDirection={tooltipDirection ?? "right"}
      onPointerEnter={() => components.HoverEntity.set({ value: buildingType })}
      onPointerLeave={() => components.HoverEntity.remove()}
      clickSound={"Bleep7"}
      onClick={() => {
        if (selectedBuilding === buildingType) {
          components.SelectedBuilding.remove();
          components.SelectedAction.remove();
          return;
        }
        components.SelectedBuilding.set({ value: buildingType });
        components.SelectedAction.set({ value: Action.PlaceBuilding });
      }}
      style={style}
    >
      <BuildingImageFromType buildingType={buildingType} isBlueprint={true} />
      {!hasMainbaseLevel && (
        <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 gap-1 flex items-center justify-center bg-neutral/50 w-full">
          <span className="h-3 flex items-center justify-center gap-1 text-warning text-[.6rem] bg-gray-800/50 z-30">
            <FaLock />
            <p>Level {levelRequirement.toString()}</p>
          </span>
        </div>
      )}
      {!hasEnough && hasMainbaseLevel && (
        <div className="absolute inset-0 gap-1 flex items-center justify-center bg-gradient-to-t from-error/30 to-transparent w-full h-full" />
      )}
      {!hideHotkeys && keybindActive && (
        <p className="absolute bottom-2 right-2 flex text-xs kbd kbd-xs">
          {KeyNames[keybinds[keybind ?? "NULL"]?.entries().next().value[0]] ?? "?"}
        </p>
      )}
    </Button>
  );
};

//Buildings
type BuildingBlueprintsProps = {
  buildingTypeToShow: number;
  active?: boolean;
  showHighlight?: boolean;
};

export const BuildingBlueprints: React.FC<BuildingBlueprintsProps> = ({
  buildingTypeToShow,
  active,
  showHighlight,
}) => {
  const selectedRockEntity = components.ActiveRock.use()?.value;
  const mapId = components.Asteroid.use(selectedRockEntity)?.mapId;

  const productionBuildings = useMemo(() => {
    let mines: Entity[] = [];
    if (mapId === 1) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
    else if (mapId === 2) mines = [EntityType.KimberliteMine];
    else if (mapId === 3) mines = [EntityType.IridiumMine];
    else if (mapId === 4) mines = [EntityType.PlatinumMine];
    else if (mapId === 5) mines = [EntityType.TitaniumMine];
    return [
      ...mines,
      EntityType.IronPlateFactory,
      EntityType.PVCellFactory,
      EntityType.AlloyFactory,
      EntityType.SolarPanel,
      EntityType.NULL,
      EntityType.NULL,
      EntityType.NULL,
    ];
  }, [mapId]);

  const storageBuildings = useMemo(
    () => [
      EntityType.Garage,
      EntityType.StorageUnit,
      EntityType.Hangar,
      EntityType.Vault,
      EntityType.NULL,
      EntityType.NULL,
    ],
    []
  );

  const militaryBuildings = useMemo(
    () => [
      EntityType.Workshop,
      EntityType.NULL,
      EntityType.SAMLauncher,
      EntityType.DroneFactory,
      EntityType.ShieldGenerator,
      EntityType.Shipyard,
    ],
    []
  );

  const infrastructureBuildings = useMemo(
    () => [EntityType.StarmapperStation, EntityType.Market, EntityType.NULL, EntityType.NULL, EntityType.NULL],
    []
  );

  const keybinds: KeybindActionKeys[] = [
    "Hotbar0",
    "Hotbar1",
    "Hotbar2",
    "Hotbar3",
    "Hotbar4",
    "Hotbar5",
    "Hotbar6",
    "Hotbar7",
  ];

  // Decide which buildings to show based on the buildingTypeToShow prop
  const buildingsToShow = useMemo(() => {
    switch (buildingTypeToShow) {
      case 0:
        return productionBuildings;
      case 1:
        return militaryBuildings;
      case 2:
        return storageBuildings;
      case 3:
        return infrastructureBuildings;
      default:
        return [];
    }
  }, [buildingTypeToShow, productionBuildings, militaryBuildings, storageBuildings, infrastructureBuildings]);

  const buildingsWithDimensions = useMemo(
    () =>
      buildingsToShow.map((building) => {
        const dimensions = getBuildingDimensions(building);
        return {
          type: building,
          dimensions,
        };
      }),
    [buildingsToShow]
  );

  return (
    <>
      <div
        className={`flex flex-wrap p-3 w-60 h-96 gap-y-1.5 gap-x-1 overflow-y-auto hide-scrollbar heropattern-graphpaper-slate-800/50 ${
          active && showHighlight ? "ring ring-warning" : ""
        }`}
      >
        {buildingsWithDimensions.map(({ type, dimensions }, i) => {
          // for dummies
          if (type === EntityType.NULL) return <div key={i} className="w-24 h-16" />;

          return (
            <BlueprintButton
              key={i}
              buildingType={type}
              keybind={
                keybinds[
                  buildingsWithDimensions
                    .filter(({ type }) => type !== EntityType.NULL)
                    .indexOf(buildingsWithDimensions[i])
                ]
              }
              keybindActive={active}
              style={{
                width: `${65 + 20 * (dimensions.width - 1)}px`,
                height: `${65 + 20 * (dimensions.height - 1)}px`,
              }}
            />
          );
        })}
      </div>
    </>
  );
};
