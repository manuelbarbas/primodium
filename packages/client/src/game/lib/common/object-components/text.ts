import { uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";

export const ObjectText = (
  text: string,
  options: {
    id?: string;
    fontSize?: number;
    align?: string;
    backgroundColor?: string;
  } = {}
): GameObjectComponent<"Text"> => {
  const { id, fontSize = 5, align = "center", backgroundColor } = options;

  return {
    id: id ?? uuid(),
    once: (gameObject) => {
      gameObject.setText(text);
      gameObject.setFontSize(fontSize);
      gameObject.setResolution(3);
      gameObject.setAlign(align);
      if (backgroundColor) gameObject.setBackgroundColor(backgroundColor);
      gameObject.setOrigin(0.5, 0.5);
    },
  };
};
