import { useMud } from "src/hooks";

export function Increment() {
  const { components, systems } = useMud();

  const counter = components.Counter.use();
  const doubleCounter = components.DoubleCounter.use();
  const blockNumber = components.BlockNumber.use();
  const account = components.Account.use();
  return (
    <div className="flex flex-col text-white">
      <div className="h-20">
        Block Number: <span>{blockNumber?.value.toString() ?? "??"}</span>
        <br />
        Account: <span>{account?.value.toString() ?? "??"}</span>
        <br />
        Counter: <span>{counter?.value ?? "??"}</span>
        <br />
        Double Counter!: <span>{doubleCounter?.value ?? "??"}</span>
      </div>
      <button type="button" onClick={systems.increment}>
        Increment
      </button>
    </div>
  );
}
