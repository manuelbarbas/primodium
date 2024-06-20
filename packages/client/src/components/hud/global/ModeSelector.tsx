import { Button } from "@/components/core/Button";
import { IconLabel } from "@/components/core/IconLabel";

import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { FaMagnifyingGlassMinus, FaMagnifyingGlassPlus } from "react-icons/fa6";
import { useCore } from "@primodiumxyz/core/react";
import { Mode } from "@primodiumxyz/core";

export const ModeSelector = () => {
  const { tables } = useCore();
  const playerEntity = tables.Account.use()?.value;
  const buildRock = tables.BuildRock.use()?.value;
  const playerHome = tables.Home.use(playerEntity)?.value as Entity | undefined;
  const currentMode = tables.SelectedMode.use()?.value;
  const selectedRock = tables.SelectedRock.use()?.value;
  const ownedBy = tables.OwnedBy.use(selectedRock)?.value;
  const isShard = !!tables.ShardAsteroid.use(selectedRock);
  const ownedByPlayer = ownedBy === playerEntity;

  return (
    <div className="flex flex-col items-center pointer-events-auto p-4 relative">
      <div className="flex flex-col items-center relative">
        {(currentMode === Mode.Asteroid || currentMode === Mode.Spectate) && (
          <>
            <Button
              variant="info"
              size="md"
              keybind="NextHotbar"
              motion="disabled"
              clickSound="Execute"
              onClick={() => {
                tables.SelectedMode.set({
                  value: Mode.CommandCenter,
                });
              }}
            >
              <div className="flex flex-start px-1 gap-3 w-full">
                <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Command} />
                <div className="flex flex-col items-start">
                  <p>
                    OPEN COMMAND CENTER <FaMagnifyingGlassMinus size={12} className="inline opacity-50" />
                  </p>
                  {ownedByPlayer && <p className="block text-xs opacity-75">CREATE/MANAGE WITH FLEETS IN ORBIT</p>}
                  {!ownedByPlayer && <p className="block text-xs opacity-75">ENGAGE WITH FLEETS IN ORBIT</p>}
                </div>
              </div>
            </Button>
            <Button
              variant="neutral"
              size="content"
              className="!px-3 py-2 border-t-0"
              keybind="PrevHotbar"
              motion="disabled"
              onClick={() => {
                tables.SelectedMode.set({
                  value: Mode.Starmap,
                });
              }}
            >
              <div className="flex flex-start px-1 gap-3 w-full">
                <IconLabel className="text-sm drop-shadow-lg" imageUri={InterfaceIcons.Starmap} />
                <div className="flex flex-col items-start">
                  <p>
                    STARBELT <FaMagnifyingGlassMinus size={12} className="inline opacity-50" />
                  </p>
                </div>
              </div>
            </Button>
          </>
        )}
        {currentMode === Mode.CommandCenter && (
          <>
            <Button
              variant="secondary"
              size="md"
              keybind="NextHotbar"
              motion="disabled"
              clickSound="Execute"
              onClick={() => {
                tables.SelectedMode.set({
                  value: Mode.Starmap,
                });
              }}
            >
              <div className="flex flex-start px-1 gap-3 w-full">
                <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Starmap} />
                <div className="flex flex-col items-start">
                  <p>
                    OPEN STARBELT <FaMagnifyingGlassMinus size={12} className="inline opacity-50" />
                  </p>
                  <p className="block text-xs opacity-75">TRAVEL TO AND VIEW ASTEROIDS</p>
                </div>
              </div>
            </Button>
            {ownedByPlayer && (
              <Button
                variant="neutral"
                size="content"
                className="!px-3 py-2 border-t-0"
                keybind="PrevHotbar"
                motion="disabled"
                onClick={() => {
                  const rock = selectedRock ?? buildRock ?? playerHome;
                  if (rock) tables.ActiveRock.set({ value: rock });
                  else tables.ActiveRock.remove();
                  tables.SelectedMode.set({
                    value: Mode.Asteroid,
                  });
                }}
              >
                <div className="flex flex-start px-1 gap-3 w-full">
                  <IconLabel className="text-sm drop-shadow-lg" imageUri={InterfaceIcons.Build} />
                  <div className="flex flex-col items-start">
                    <p>
                      BUILD <FaMagnifyingGlassPlus size={12} className="inline opacity-50" />
                    </p>
                  </div>
                </div>
              </Button>
            )}
            {!ownedByPlayer && !isShard && (
              <Button
                variant="neutral"
                size="content"
                className="!px-3 py-2 border-t-0"
                keybind="PrevHotbar"
                onClick={() => {
                  if (!selectedRock) return;

                  tables.ActiveRock.set({ value: selectedRock });
                  tables.SelectedMode.set({
                    value: Mode.Spectate,
                  });
                }}
              >
                <div className="flex flex-start px-1 gap-3 w-full">
                  <IconLabel className="text-sm drop-shadow-lg" imageUri={InterfaceIcons.Spectate} />
                  <div className="flex flex-col items-start">
                    <p>
                      SPECTATE <FaMagnifyingGlassPlus size={12} className="inline opacity-50" />
                    </p>
                  </div>
                </div>
              </Button>
            )}
          </>
        )}
        {currentMode === Mode.Starmap && (
          <>
            <Button
              variant="error"
              size="md"
              keybind="NextHotbar"
              motion="disabled"
              clickSound="Execute"
              onClick={() => {
                if (playerHome) tables.ActiveRock.set({ value: playerHome as Entity });
                else tables.ActiveRock.remove();
                tables.SelectedMode.set({
                  value: Mode.Asteroid,
                });
              }}
            >
              <div className="flex flex-start px-1 gap-3 w-full">
                <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Build} />
                <div className="flex flex-col items-start">
                  <p>
                    RETURN TO BUILDING <FaMagnifyingGlassPlus size={12} className="inline opacity-50" />
                  </p>
                  <p className="block text-xs opacity-75">CONTINUE RESOURCE EXTRACTION</p>
                </div>
              </div>
            </Button>
            <Button
              variant="neutral"
              size="content"
              className="!px-3 py-2 border-t-0"
              keybind="PrevHotbar"
              motion="disabled"
              onClick={() => {
                tables.SelectedMode.set({
                  value: Mode.CommandCenter,
                });
              }}
            >
              <div className="flex flex-start px-1 gap-3 w-full">
                <IconLabel className="text-sm drop-shadow-lg" imageUri={InterfaceIcons.Command} />
                <div className="flex flex-col items-start">
                  <p>
                    COMMAND CENTER <FaMagnifyingGlassPlus size={12} className="inline opacity-50" />
                  </p>
                </div>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
