import { NetworkLayer } from "../network/types";

export default function Increment() {
  const makeIncrement = async () => {
    const networkLayer: NetworkLayer = (window as any).network;
    const feedback = await networkLayer.api.makeIncrement();
    console.log(feedback);
  };

  return (
    <>
      <p>MUD test</p>
      <button onClick={makeIncrement}>Increment</button>
    </>
  );
}
