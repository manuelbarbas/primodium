import { Button } from "@/components/core/Button";
import { AsteroidStatsAndActions } from "@/components/hud/command/overview/AsteroidStatsAndActions";
import { useGame } from "@/hooks/useGame";
import { components } from "@/network/components";

export const Overview = () => {
  const game = useGame();
  return (
    <>
      <Button
        className="mt-48"
        onClick={() => {
          game.COMMAND_CENTER.objects.asteroid.get(components.SelectedRock.get()?.value)?.fireAt({ x: 32, y: 32 });
          game.COMMAND_CENTER.fx.emitFloatingText({ x: 0, y: 0 }, "hit me with ur best shot, fire awaay! 🎵");
        }}
      >
        hit me with ur best shot, fire awaay! 🎵
      </Button>
      <AsteroidStatsAndActions />
    </>
  );
};
