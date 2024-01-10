import { useMud } from "src/hooks";
import { increment } from "src/network/setup/contractCalls/increment";

export function Increment() {
  const { components } = useMud();

  const counter = components.Counter.use();
  const doubleCounter = components.DoubleCounter.use();
  const blockNumber = components.BlockNumber.use();

  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
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
      <button type="button" onClick={() => increment(mud)}>
        Increment
      </button>
    </div>
  );
}
