import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Range } from "src/components/core/Range";
import { useSettingsStore } from "src/game/stores/SettingsStore";
import { usePrimodium } from "src/hooks/usePrimodium";

export const AudioSettings = () => {
  const { master, sfx, ui, music } = useSettingsStore((state) => state.volume);
  // const setVolume = useSettingsStore((state) => state.setVolume);
  const { setVolume } = usePrimodium().api().audio;

  return (
    <Navigator.Screen title="audio">
      <SecondaryCard className="w-full space-y-5">
        <div>
          <p className="text-xs opacity-50 font-bold text-accent pb-1">MASTER</p>
          <Range
            min={0}
            max={100}
            defaultValue={master * 100}
            className="range-accent"
            onChange={(e) => {
              setVolume(e / 100, "master");
            }}
          />
        </div>
        <div>
          <p className="text-xs opacity-50 font-bold pb-1 range-xs">MUSIC</p>
          <Range
            min={0}
            max={100}
            defaultValue={music * 100}
            className="range-xs"
            onChange={(e) => {
              setVolume(e / 100, "music");
            }}
          />
        </div>
        <div>
          <p className="text-xs opacity-50 font-bold pb-1">SFX</p>
          <Range
            min={0}
            max={100}
            defaultValue={sfx * 100}
            className="range-xs"
            onChange={(e) => {
              setVolume(e / 100, "sfx");
            }}
          />
        </div>
        <div>
          <p className="text-xs opacity-50 font-bold pb-1">UI</p>
          <Range
            min={0}
            max={100}
            defaultValue={ui * 100}
            className="range-xs"
            onChange={(e) => {
              setVolume(e / 100, "ui");
            }}
          />
        </div>
      </SecondaryCard>
      <Navigator.BackButton className="mt-2" />
    </Navigator.Screen>
  );
};
