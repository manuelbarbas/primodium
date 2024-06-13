import { MainbaseLevelToEmblem } from "@/game/lib/mappings";
import { useGame } from "@/hooks/useGame";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";

export function useAsteroidEmblem(asteroid?: Entity): string {
  const game = useGame();
  const { tables } = useCore();
  if (!asteroid) return InterfaceIcons.NotAllowed;
  const level = Number(tables.Level.use(asteroid)?.value ?? 0n);

  const emblem = MainbaseLevelToEmblem[level - 1];
  if (!emblem) return InterfaceIcons.NotAllowed;
  const { getSpriteBase64 } = game.ASTEROID.sprite;
  return getSpriteBase64(emblem);
}
