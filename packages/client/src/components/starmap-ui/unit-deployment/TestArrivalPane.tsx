import { Arrival } from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";

export function TestArrivalPane() {
  const orbits = Arrival.use({ onlyOrbiting: true });
  const inTransits = Arrival.use({ onlyTransit: true });
  const blockNumber = BlockNumber.use()?.value;
  return (
    <div className="absolute bottom-0 z-[100]">
      <p>Current block: {blockNumber}</p>
      <p className="bold">Orbiting</p>
      {orbits.map((arrival, i) => {
        if (!arrival) return null;
        return (
          <div key={i} className="text-sm text-gray-300">
            <p>Arrival {i}</p>
            <p>Send Type: {arrival.sendType}</p>
            <p>Unit Counts: {arrival.unitCounts}</p>
            <p>Unit Types: {arrival.unitTypes}</p>
            <p>Arrival Block: {Number(arrival.arrivalBlock)}</p>
            <p>From: {arrival.from}</p>
            <p>To: {arrival.to}</p>
            <p>Origin: {arrival.origin}</p>
            <p>Destination: {arrival.destination}</p>
          </div>
        );
      })}
      <p className="bold">In Transit</p>
      {inTransits.map((arrival, i) => {
        if (!arrival) return null;
        return (
          <div key={i} className="text-sm">
            <p>Arrival {i}</p>
            <p>Send Type: {arrival.sendType}</p>
            <p>Unit Counts: {arrival.unitCounts}</p>
            <p>Unit Types: {arrival.unitTypes}</p>
            <p>Arrival Block: {Number(arrival.arrivalBlock)}</p>
            <p>From: {arrival.from}</p>
            <p>To: {arrival.to}</p>
            <p>Origin: {arrival.origin}</p>
            <p>Destination: {arrival.destination}</p>
          </div>
        );
      })}
    </div>
  );
}
