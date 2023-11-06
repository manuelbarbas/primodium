import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { NUM_UNITS } from "src/util/constants";
import { UnitCountTuple } from "src/util/web3/types";
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
      name: "arrivalTime",
      type: "uint256",
    },
    {
      name: "sendTime",
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
      type: `uint256[${NUM_UNITS}]`,
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
  unitCounts: UnitCountTuple;
};

const decodeArrival = (rawArrival: Hex) => {
  return decodeAbiParameters([ArrivalAbi], rawArrival)[0] as Arrival;
};

export const setupArrival = () => {
  const { Arrival, MapItemArrivals } = components;

  defineComponentSystem(world, MapItemArrivals, ({ entity, value: [newValue] }) => {
    const newVal = newValue?.value;
    if (!newVal) {
      return Arrival.remove(entity);
    }
    const arrival = decodeArrival(newVal as Hex);
    Arrival.set(arrival, entity);
  });
};
