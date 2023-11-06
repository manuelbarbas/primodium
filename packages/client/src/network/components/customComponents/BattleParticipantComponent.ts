import { Metadata, Type } from "@latticexyz/recs";
import { world } from "src/network/world";
import { Options, createExtendedComponent } from "./ExtendedComponent";

export function BattleParticipantComponent<M extends Metadata>(options?: Options<M>) {
  return createExtendedComponent(
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
