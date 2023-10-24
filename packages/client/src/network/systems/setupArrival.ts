import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { ESendType, MUDEnums } from "contracts/config/enums";
import { Hex, decodeAbiParameters } from "viem";
import { components } from "../components";
import { world } from "../world";

const ArrivalAbi = {
  components: [
    {
      name: "sendType",
      type: "uint8",
    },
    {
      name: "sendTime",
      type: "uint256",
    },
    {
      name: "arrivalTime",
      type: "uint256",
    },
    {
      name: "from",
      type: "bytes32",
    },
    {
      name: "to",
      type: "bytes32",
    },
    {
      name: "origin",
      type: "bytes32",
    },
    {
      name: "destination",
      type: "bytes32",
    },
    {
      name: "unitCounts",
      type: `uint256[${MUDEnums.EUnit.length}]`,
    },
  ],
  name: "arrival",
  type: "tuple",
} as const;

type Arrival = {
  sendType: ESendType;
  arrivalTime: bigint;
  sendTime: bigint;
  from: Entity;
  to: Entity;
  origin: Entity;
  destination: Entity;
  unitCounts: bigint[]; // corresponds to EUnit: ["MiningVessel", "AegisDrone", "HammerDrone", "StingerDrone", "AnvilDrone"]
};

const decodeArrival = (rawArrival: Hex) => {
  console.log("raw arrival:,", rawArrival);
  return decodeAbiParameters([ArrivalAbi], rawArrival)[0] as Arrival;
};

export const setupArrival = () => {
  const { Arrival, MapItemArrivals } = components;

  defineComponentSystem(world, MapItemArrivals, ({ entity, value: [newValue] }) => {
    const newVal = newValue?.value;
    if (!newVal) return Arrival.remove(entity);
    const arrival = decodeArrival(newVal as Hex);
    Arrival.set(arrival, entity);
  });
};
