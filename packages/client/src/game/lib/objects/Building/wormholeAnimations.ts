import { Animations, Sprites } from "@primodiumxyz/assets";

export const wormholeStates = { idle: "idle", overheating: "overheating", cooldown: "cooldown", powerup: "powerup" };
export type WormholeStates = (typeof wormholeStates)[keyof typeof wormholeStates];

export const WormholeStateToAnimation: Record<WormholeStates, Animations> = {
  idle: Animations.WormholebaseIdle1,
  overheating: Animations.WormholebaseOverheat1,
  cooldown: Animations.WormholebaseCooldown1,
  powerup: Animations.WormholebasePowerUp1,
};

export const WormholeStateToSprite: Record<WormholeStates, Sprites> = {
  idle: Sprites.WormholebaseIdle1,
  overheating: Sprites.WormholebaseOverheat1,
  cooldown: Sprites.WormholebaseCooldown1,
  powerup: Sprites.WormholebasePowerUp1,
};

export function getWormholeAssetKeyPair(state: WormholeStates) {
  const spriteKey = WormholeStateToSprite[state];
  const animationKey = WormholeStateToAnimation[state];

  return {
    sprite: spriteKey,
    animation: animationKey,
  };
}
