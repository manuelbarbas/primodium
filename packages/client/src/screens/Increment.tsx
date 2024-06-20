import { useContractCalls } from "@/hooks/useContractCalls";
import { useCore, useAccountClient } from "@primodiumxyz/core/react";

export function Increment() {
  const { tables } = useCore();
  const {
    playerAccount: { entity },
  } = useAccountClient();
  const { increment } = useContractCalls();

  const counter = tables.Counter.use();
  const doubleCounter = tables.DoubleCounter.use();
  const blockNumber = tables.BlockNumber.use();

  return (
    <div className="flex flex-col text-white">
      <div className="h-20">
        Block Number: <span>{blockNumber?.value.toString() ?? "??"}</span>
        <br />
        Account: <span>{entity ?? "??"}</span>
        <br />
        Counter: <span>{counter?.value.toString() ?? "??"}</span>
        <br />
        Double Counter!: <span>{doubleCounter?.value.toString() ?? "??"}</span>
      </div>
      <button type="button" onClick={() => increment()}>
        Increment
      </button>
    </div>
  );
}
