import { useMud } from "src/hooks";

export function Increment() {
  const { components } = useMud();

  const counter = components.Counter.use();
  const doubleCounter = components.DoubleCounter.use();
  const blockNumber = components.BlockNumber.use();

  const {
    playerAccount: { entity: playerEntity },
  } = useMud();
  return (
    <div className="flex flex-col text-white">
      <div className="h-20">
        Block Number: <span>{blockNumber?.value.toString() ?? "??"}</span>
        <br />
        Account: <span>{playerEntity ?? "??"}</span>
        <br />
        Counter: <span>{counter?.value.toString() ?? "??"}</span>
        <br />
        Double Counter!: <span>{doubleCounter?.value.toString() ?? "??"}</span>
      </div>
      <button
        type="button"
        // onClick={contractCalls.increment}
      >
        Increment
      </button>
    </div>
  );
}
