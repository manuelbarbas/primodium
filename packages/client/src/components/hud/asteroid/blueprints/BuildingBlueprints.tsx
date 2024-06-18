import { Button } from "@/components/core/Button";
import { BuildingImageFromType } from "@/components/shared/BuildingImage";
import { Action, EntityType } from "@primodiumxyz/core";
import { useCore, useHasEnoughResources } from "@primodiumxyz/core/react";
import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { EMap } from "contracts/config/enums";
import { useEffect, useMemo } from "react";
import { FaLock } from "react-icons/fa";
import { useGame } from "@/hooks/useGame";
import { useShallow } from "zustand/react/shallow";
import { KeybindActionKeys, KeyNames } from "@primodiumxyz/game";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";

const BlueprintButton: React.FC<{
  selectedRock: Entity;
  buildingType: Entity;
  tooltipDirection?: "left" | "right" | "top" | "bottom";
  keybind?: KeybindActionKeys;
  keybindActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ selectedRock, buildingType, tooltipDirection, keybind, keybindActive = true, style }) => {
  const {
    hooks: { useKeybinds },
    input: { addListener },
  } = useGame().ASTEROID;
  const { tables, utils } = useCore();
  const [hideHotkeys] = usePersistentStore(useShallow((state) => [state.hideHotkeys]));
  const keybinds = useKeybinds();
  const rockMainBase = tables.Home.use(selectedRock)?.value;
  const selectedBuilding = tables.SelectedBuilding.use()?.value;
  const mainbaseLevel = tables.Level.use(rockMainBase as Entity)?.value ?? 1n;
  const levelRequirement = tables.P_RequiredBaseLevel.getWithKeys({ prototype: buildingType, level: 1n })?.value ?? 1n;
  const hasMainbaseLevel = mainbaseLevel >= levelRequirement;

  const hasEnough = useHasEnoughResources(utils.getRecipe(buildingType, 1n), selectedRock);

  const alreadyBuilt =
    useQuery({
      withProperties: [
        { table: tables.BuildingType, properties: { value: EntityType.StarmapperStation } },
        { table: tables.OwnedBy, properties: { value: selectedRock } },
      ],
    }).length > 0 && buildingType === EntityType.StarmapperStation;

  useEffect(() => {
    if (!keybindActive || !keybind) return;

    const key = addListener(keybind, () => {
      if (selectedBuilding === buildingType) {
        tables.SelectedBuilding.remove();
        tables.SelectedAction.remove();
        return;
      }

      tables.SelectedBuilding.set({ value: buildingType });
    });

    return () => key.dispose();
  }, [keybind, keybindActive, buildingType, selectedBuilding, addListener]);

  return (
    <Button
      className={`hover:scale-110 drop-shadow-hard`}
      variant={buildingType === selectedBuilding ? "warning" : "ghost"}
      disabled={alreadyBuilt || mainbaseLevel < levelRequirement}
      keybind={keybindActive ? keybind : undefined}
      tooltipDirection={tooltipDirection ?? "right"}
      onPointerEnter={() => tables.HoverEntity.set({ value: buildingType })}
      onPointerLeave={() => tables.HoverEntity.remove()}
      clickSound={"Bleep7"}
      onClick={() => {
        if (selectedBuilding === buildingType) {
          tables.SelectedBuilding.remove();
          tables.SelectedAction.remove();
          return;
        }
        tables.SelectedBuilding.set({ value: buildingType });
        tables.SelectedAction.set({ value: Action.PlaceBuilding });
      }}
      style={style}
    >
      <BuildingImageFromType buildingType={buildingType} isBlueprint={true} />
      {alreadyBuilt && (
        <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 gap-1 flex items-center justify-center bg-neutral/50 w-full">
          <span className="flex items-center flex-col justify-center gap-1 text-warning text-[.6rem] bg-gray-800/50 z-30">
            <FaLock />
            <p>One per</p>
            <p>asteroid</p>
          </span>
        </div>
      )}
      {!alreadyBuilt && !hasMainbaseLevel && (
        <div className="absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 gap-1 flex items-center justify-center bg-neutral/50 w-full">
          <span className="h-3 flex items-center justify-center gap-1 text-warning text-[.6rem] bg-gray-800/50 z-30">
            <FaLock />
            <p>Level {levelRequirement.toString()}</p>
          </span>
        </div>
      )}

      {!alreadyBuilt && !hasEnough && hasMainbaseLevel && (
        <div className="absolute inset-0 gap-1 flex items-center justify-center bg-gradient-to-t from-error/30 to-transparent w-full h-full" />
      )}
      {!alreadyBuilt && !hideHotkeys && keybindActive && (
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
  const { tables, utils } = useCore();
  const selectedRockEntity = tables.ActiveRock.use()?.value;
  const mapId = tables.Asteroid.use(selectedRockEntity)?.mapId;

  const productionBuildings = useMemo(() => {
    let mines: Entity[] = [];
    if (mapId === EMap.Primary) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
    else if (mapId === EMap.Kimberlite) mines = [EntityType.KimberliteMine];
    else if (mapId === EMap.Iridium) mines = [EntityType.IridiumMine];
    else if (mapId === EMap.Platinum) mines = [EntityType.PlatinumMine];
    else if (mapId === EMap.Titanium) mines = [EntityType.TitaniumMine];
    else if (mapId === EMap.Wormhole) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
    else if (mapId === EMap.Common) mines = [EntityType.IronMine, EntityType.CopperMine, EntityType.LithiumMine];
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
        const dimensions = utils.getBuildingDimensions(building);
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
          if (!selectedRockEntity || type === EntityType.NULL) return <div key={i} className="w-24 h-16" />;

          return (
            <BlueprintButton
              selectedRock={selectedRockEntity}
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
