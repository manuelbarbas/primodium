import { GameObjectTypes, GameObject } from "../../types";

export function isSprite(
  gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): gameObject is GameObject<"Sprite"> {
  return type === "Sprite";
}

export function isRectangle(
  gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): gameObject is GameObject<"Rectangle"> {
  return type === "Rectangle";
}

export function isGraphics(
  gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): gameObject is GameObject<"Graphics"> {
  return type === "Graphics";
}
