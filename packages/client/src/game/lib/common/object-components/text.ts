import { uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";

export const ObjectText = (
  text: string,
  options: {
    id?: string;
    font?: string;
    fontSize?: number;
    color?: number;
  } = {}
): GameObjectComponent<"BitmapText"> => {
  const { id, font = "teletactile", fontSize = 12, color = 0x00ffff } = options;

  return {
    id: id ?? uuid(),
    once: (gameObject) => {
      gameObject.setFont(font).setTintFill(color).setText(text).setFontSize(fontSize);
    },
  };
};
