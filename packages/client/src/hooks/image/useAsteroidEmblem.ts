import { useGame } from "@/hooks/useGame";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";

export function useAsteroidEmblem(asteroid?: Entity): string {
  const game = useGame();
  const { tables } = useCore();
  const level = tables.Level.use(asteroid)?.value ?? tables.Level.get(asteroid)?.value ?? 1n;

  return useMemo(() => {
    return !asteroid ? InterfaceIcons.NotAllowed : game.STARMAP.sprite.getEmblemSprite(level);
  }, [level, game.STARMAP.sprite, asteroid]);
}
