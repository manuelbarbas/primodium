import { SingletonID } from "@latticexyz/network";
import { useMud } from "../context/MudContext";
import { execute } from "../network/actions";
import { Counter } from "src/network/components/chainComponents";
import { DoubleCounter } from "src/network/components/clientComponents";

export default function Increment() {
  const { systems, providers } = useMud();

  const counter = Counter.use();
  const doubleCounter = DoubleCounter.use();
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
