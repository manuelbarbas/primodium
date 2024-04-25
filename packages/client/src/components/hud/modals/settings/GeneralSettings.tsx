import { Join } from "@/components/core/Join";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Range } from "src/components/core/Range";
import { Toggle } from "src/components/core/Toggle";
import { usePersistentStore } from "src/game/stores/PersistentStore";

export const GeneralSettings = () => {
  const [uiScale, setUiScale, hideHotkeys, setHideHotkeys] = usePersistentStore((state) => [
    state.uiScale,
    state.setUiScale,
    state.hideHotkeys,
    state.setHideHotkeys,
  ]);

  const [fontStyle, setFontStyle] = usePersistentStore((state) => [state.fontStyle, state.setFontStyle]);

  return (
    <Navigator.Screen title="general" className="flex-grow">
      <div className="w-full h-full">
        <SecondaryCard className="w-full space-y-5 grow">
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
            <div className="text-xs opacity-50 font-bold pb-1">HIDE HOTKEYS</div>
            <Toggle onToggle={() => setHideHotkeys(!hideHotkeys)} defaultChecked={hideHotkeys} />
          </div>

          <div>
            <p className="text-xs opacity-50 font-bold pb-1 uppercase">font style</p>
            <Join className="block">
              <Button
                className={`btn-sm ${fontStyle === "font-mono" ? "border border-accent" : ""}`}
                onClick={() => setFontStyle("font-mono")}
              >
                MONO
              </Button>
              <Button
                className={`btn-sm ${fontStyle === "font-pixel" ? "border border-accent" : ""}`}
                onClick={() => setFontStyle("font-pixel")}
              >
                PIXEL
              </Button>
            </Join>
          </div>
        </SecondaryCard>
      </div>

      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
