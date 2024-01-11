import { singletonEntity } from "@latticexyz/store-sync/recs";
import { execute, executeBatch } from "src/network/actions";
import { MUD } from "src/network/types";
import { SYSTEMBOUND_DELEGATION, TransactionQueueType } from "src/util/constants";
import { getSystemId } from "src/util/encode";
import { Address, Hex, encodeFunctionData, maxUint256 } from "viem";
const DelegationAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
      {
        internalType: "ResourceId",
        name: "systemId",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "numCalls",
        type: "uint256",
      },
    ],
    name: "initDelegation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const systems = [
  "AllianceSystem",
  "BuildSystem",
  "ClaimObjectiveSystem",
  "ClaimUnitsSystem",
  "DestroySystem",
  "IncrementSystem",
  "MoveBuildingSystem",
  "ToggleBuildingSystem",
  "TrainSystem",
  "UpgradeBuildingSystem",
  "UpgradeRangeSystem",
  "UpgradeUnitSystem",
];

const getCalls = (address: Address) =>
  systems.map((system) => ({
    systemId: getSystemId("core"),
    functionName: "registerDelegation",
    args: [
      address,
      SYSTEMBOUND_DELEGATION,
      encodeFunctionData({
        abi: DelegationAbi,
        functionName: "initDelegation",
        args: [address, getSystemId(system), maxUint256],
      }),
    ],
  })) as {
    systemId: Hex;
    functionName: "registerDelegation";
    args: [Hex, Hex, Hex];
  }[];

export const grantAccess = async (mud: MUD, address: Address) => {
  const calls = getCalls(address);

  await executeBatch(
    { mud, systemCalls: calls },
    {
      id: singletonEntity,
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};

export const revokeAccess = async (mud: MUD, address: Address) => {
  await execute(
    { mud, systemId: getSystemId("DelegationSystem"), functionName: "unregisterDelegation", args: [address] },
    {
      id: singletonEntity,
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};

export const switchDelegate = async (mud: MUD, newDelegate: Address) => {
  const currentDelegate = mud.sessionAccount?.address;
  if (!currentDelegate) return;

  await executeBatch(
    {
      mud,
      systemCalls: [
        { systemId: getSystemId("DelegationSystem"), functionName: "unregisterDelegation", args: [newDelegate] },
        ...getCalls(newDelegate),
      ],
    },
    {
      id: singletonEntity,
      delegate: false,
      type: TransactionQueueType.Access,
    },
    (receipt) => {
      receipt;
    }
  );
};
