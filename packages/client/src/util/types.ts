import { Entity } from "@latticexyz/recs";
import { Coord } from "@primodiumxyz/engine/types";

export type ContractCoord = Coord & { parentEntity: Entity };

export type BlockTypeActionComponent = {
  action: () => void;
};

export type SimpleCardinal = "up" | "down" | "left" | "right";

export enum ActiveButton {
  NONE,
  ORIGIN,
  DESTINATION,
}
