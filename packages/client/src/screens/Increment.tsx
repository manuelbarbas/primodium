import { GodID as SingletonID } from "@latticexyz/network";
import { useComponentValue } from "@latticexyz/react";
import { singletonIndex, offChainComponents } from "..";
import { useMud } from "../context/MudContext";

export default function Increment() {
  const { components, systems } = useMud();

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
