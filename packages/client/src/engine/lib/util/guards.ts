import { GameObjectTypes, GameObject } from "../../types";

export function isSprite(
  _gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): _gameObject is GameObject<"Sprite"> {
  return type === "Sprite";
}

export function isRectangle(
  _gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): _gameObject is GameObject<"Rectangle"> {
  return type === "Rectangle";
}

export function isGraphics(
  _gameObject: Phaser.GameObjects.GameObject,
  type: keyof GameObjectTypes
): _gameObject is GameObject<"Graphics"> {
  return type === "Graphics";
}
