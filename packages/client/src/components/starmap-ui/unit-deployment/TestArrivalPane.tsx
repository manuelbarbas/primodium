import { Arrival } from "src/network/components/chainComponents";

export function TestArrivalPane() {
  const orbits = Arrival.use({ onlyOrbiting: true });
  const inTransits = Arrival.use({ onlyTransit: true });
  return (
    <div>
      <p>TestArrivalPane</p>
      {orbits.map((arrival, i) => {
        if (!arrival) return null;
        return (
          <div key={i}>
            <p>Arrival {i}</p>
            <p>Send Type: {arrival.sendType}</p>
            <p>Unit Counts: {arrival.unitCounts}</p>
            <p>Unit Types: {arrival.unitTypes}</p>
            <p>Arrival Block: {arrival.arrivalBlock}</p>
            <p>From: {arrival.from}</p>
            <p>To: {arrival.to}</p>
            <p>Origin: {arrival.origin}</p>
            <p>Destination: {arrival.destination}</p>
          </div>
        );
      })}
      {inTransits.map((arrival, i) => {
        if (!arrival) return null;
        return (
          <div key={i}>
            <p>Arrival {i}</p>
            <p>Send Type: {arrival.sendType}</p>
            <p>Unit Counts: {arrival.unitCounts}</p>
            <p>Unit Types: {arrival.unitTypes}</p>
            <p>Arrival Block: {arrival.arrivalBlock}</p>
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
