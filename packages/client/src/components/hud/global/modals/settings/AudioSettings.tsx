import { useCallback } from "react";

import { Channel } from "@primodiumxyz/game";
import { usePersistentStore } from "@primodiumxyz/game/src/stores/PersistentStore";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";
import { Range } from "@/components/core/Range";
import { useGame } from "@/hooks/useGame";

export const AudioSettings = () => {
  const { master, sfx, ui, music } = usePersistentStore((state) => state.volume);
  const game = useGame();

  const setVolume = useCallback(
    (amount: number, channel: Channel | "master") => {
      game.ASTEROID.audio.setVolume(amount, channel);
      game.UI.audio.setVolume(amount, channel);
      game.STARMAP.audio.setVolume(amount, channel);
      game.COMMAND_CENTER.audio.setVolume(amount, channel);
      game.ROOT.audio.setVolume(amount, channel);
    },
    [game],
  );

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
