import { GodID as SingletonID, TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";
import { SystemTypes } from "contracts/types/SystemTypes";
import { useComponentValue } from "@latticexyz/react";
import { components, singletonIndex, offChainComponents } from "..";

type Props = {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof components;
};

export default function Increment({ systems, components }: Props) {
  const counter = useComponentValue(components.Counter, singletonIndex);
  const doubleCounter = useComponentValue(
    offChainComponents.DoubleCounter,
    singletonIndex
  );

  return (
    <>
      <div>
        Counter: <span>{counter?.value ?? "??"}</span>
        <br />
        Double Counter!: <span>{doubleCounter?.value ?? "??"}</span>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          systems["system.Increment"].executeTyped(SingletonID);
        }}
      >
        Increment
      </button>
    </>
  );
}
