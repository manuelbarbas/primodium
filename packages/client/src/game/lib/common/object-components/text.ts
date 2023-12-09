import { uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";

export const ObjectText = (
  text: string,
  options: {
    id?: string;
    fontSize?: number;
    align?: string;
    color?: string;
    backgroundColor?: string;
  } = {}
): GameObjectComponent<"Text"> => {
  const { id, fontSize = 5, align = "center", backgroundColor, color } = options;

  return {
    id: id ?? uuid(),
    once: (gameObject) => {
      gameObject.setText(text);
      gameObject.setFontSize(fontSize);
      gameObject.setResolution(5);
      gameObject.setAlign(align);
      if (color) gameObject.setColor(color);
      if (backgroundColor) gameObject.setBackgroundColor(backgroundColor);
    },
  };
};
