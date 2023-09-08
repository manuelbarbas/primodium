import { Metadata, Type } from "@latticexyz/recs";
import { world } from "src/network/world";
import newComponent, { Options } from "./ExtendedComponent";

export function BattleParticipantComponent<Overridable extends boolean, M extends Metadata>(
  options?: Options<Overridable, M>
) {
  return newComponent(
    world,
    {
      participantEntity: Type.Entity,
      unitTypes: Type.EntityArray,
      unitLevels: Type.NumberArray,
      unitCounts: Type.NumberArray,
    },
    options
  );
}
