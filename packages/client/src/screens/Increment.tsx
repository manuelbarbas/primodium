import { SingletonID } from "@latticexyz/network";
import { useMud } from "../context/MudContext";
import { execute } from "../network/actions";
import { Counter } from "src/network/components/chainComponents";
import { DoubleCounter } from "src/network/components/clientComponents";
import { useComponentValue } from "src/hooks/useComponentValue";

export default function Increment() {
  const { systems, providers } = useMud();

  const counter = useComponentValue(Counter);
  const doubleCounter = useComponentValue(DoubleCounter);
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
