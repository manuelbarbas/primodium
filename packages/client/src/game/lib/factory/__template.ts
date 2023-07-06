// THIS FILE IS FOR REFERENCE ONLY
import { GameObjectComponent, GameObjectTypes } from "../../../engine/types";

export const createTemplate = <
  T extends keyof GameObjectTypes
>(): GameObjectComponent<T> => {
  return {
    id: "template",
    now: () => {},
    once: () => {},
    update: () => {},
  };
};
