import { useMud } from "src/hooks";

export default function Increment() {
  const { components, systems } = useMud();

  const counter = components.Counter.use();
  // const doubleCounter = DoubleCounter.use();
  return (
    <div className="flex flex-col text-white">
      <div className="h-20">
        Counter: <span>{counter?.value ?? "??"}</span>
        <br />
        {/* Double Counter!: <span>{doubleCounter?.value ?? "??"}</span> */}
      </div>
      <button type="button" onClick={systems.increment}>
        Increment
      </button>
    </div>
  );
}
