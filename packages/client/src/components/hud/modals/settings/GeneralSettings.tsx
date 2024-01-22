import { Navigator } from "src/components/core/Navigator";
import { Range } from "src/components/core/Range";
import { Toggle } from "src/components/core/Toggle";
import { useSettingsStore } from "src/game/stores/SettingsStore";

export const GeneralSettings = () => {
  const [uiScale, setUiScale] = useSettingsStore((state) => [state.uiScale, state.setUiScale]);
  const [unitDisplay, toggleUnitDisplay] = useSettingsStore((state) => [state.unitDisplay, state.toggleUnitDisplay]);

  return (
    <Navigator.Screen title="general" className="flex-grow flex justify-center items-center">
      <div className="w-132 h-96 border border-secondary p-2">
        <div>
          <p className="text-xs opacity-50 font-bold pb-1">UI SCALE</p>
          <Range
            min={50}
            max={200}
            defaultValue={uiScale * 100}
            // className="range-accent"
            onChange={(e) => {
              setUiScale(e / 100);
            }}
          />
        </div>
        <div className="">
          <p className="text-xs opacity-50 font-bold pb-1">SHOW PRICE IN GWEI</p>
          <Toggle onToggle={toggleUnitDisplay} defaultChecked={unitDisplay === "gwei"} />
        </div>
      </div>

      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
