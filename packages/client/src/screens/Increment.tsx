import { SingletonID } from "@latticexyz/network";
import { useComponentValue } from "@latticexyz/react";
import { useMud } from "../context/MudContext";
import { execute } from "../network/actions";

export default function Increment() {
  const { components, systems, singletonIndex, offChainComponents, providers } =
    useMud();

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
          execute(
            systems["system.Increment"].executeTyped(SingletonID),
            providers
          );
        }}
      >
        Increment
      </button>
    </>
  );
}
