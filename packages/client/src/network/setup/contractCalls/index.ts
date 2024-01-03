import { curry } from "lodash";
import { SetupNetworkResult } from "src/network/types";
import {
  acceptJoinRequest,
  createAlliance,
  declineInvite,
  grantRole,
  invite,
  joinAlliance,
  kickPlayer,
  leaveAlliance,
  rejectJoinRequest,
  requestToJoin,
} from "./alliance";
import { buildBuilding } from "./buildBuilding";
import { claimObjective } from "./claimObjective";
import { claimUnits } from "./claimUnits";
import { createOrder } from "./createOrder";
import { demolishBuilding } from "./demolishBuilding";
import { removeComponent, setComponentValue } from "./dev";
import { invade } from "./invade";
import { moveBuilding } from "./moveBuilding";
import { raid } from "./raid";
import { recallArrival, recallStationedUnits } from "./recall";
import { reinforce } from "./reinforce";
import { send } from "./send";
import { spawn } from "./spawn";
import { takeOrders } from "./takeOrders";
import { toggleBuilding } from "./toggleBuilding";
import { train } from "./train";
import { updateOrder } from "./updateOrder";
import { upgradeBuilding } from "./upgradeBuilding";
import { upgradeRange } from "./upgradeRange";
import { upgradeUnit } from "./upgradeUnit";

// todo: wrap each call in transaction loading and error handling
export default function createContractCalls(network: SetupNetworkResult) {
  return {
    setComponentValue: curry(setComponentValue)(network),
    removeComponent: curry(removeComponent)(network),

    // alliance
    createAlliance: curry(createAlliance)(network),
    leaveAlliance: curry(leaveAlliance)(network),
    joinAlliance: curry(joinAlliance)(network),
    declineInvite: curry(declineInvite)(network),
    requestToJoin: curry(requestToJoin)(network),
    kickPlayer: curry(kickPlayer)(network),
    grantRole: curry(grantRole)(network),
    acceptJoinRequest: curry(acceptJoinRequest)(network),
    rejectJoinRequest: curry(rejectJoinRequest)(network),
    invite: curry(invite)(network),

    buildBuilding: curry(buildBuilding)(network),
    claimObjective: curry(claimObjective)(network),
    claimUnits: curry(claimUnits)(network),

    createOrder: curry(createOrder)(network),
    updateOrder: curry(updateOrder)(network),
    takeOrders: curry(takeOrders)(network),

    demolishBuilding: curry(demolishBuilding)(network),
    invade: curry(invade)(network),
    moveBuilding: curry(moveBuilding)(network),
    raid: curry(raid)(network),
    recallArrival: curry(recallArrival)(network),
    recallStationedUnits: curry(recallStationedUnits)(network),
    reinforce: curry(reinforce)(network),
    send: curry(send)(network),
    spawn: curry(spawn)(network),

    toggleBuilding: curry(toggleBuilding)(network),
    train: curry(train)(network),
    upgradeBuilding: curry(upgradeBuilding)(network),
    upgradeRange: curry(upgradeRange)(network),
    upgradeUnit: curry(upgradeUnit)(network),
  };
}
