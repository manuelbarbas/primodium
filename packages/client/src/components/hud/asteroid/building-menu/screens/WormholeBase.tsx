import { Button } from "@/components/core/Button";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EPointType } from "contracts/config/enums";
import { useState } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { NumberInput } from "src/components/core/NumberInput";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { Hex } from "viem";
import { ExpandRange } from "../widgets/ExpandRange";
import { Upgrade } from "../widgets/Upgrade";
import { useAccountClient, useCore, useResourceCount, useWormholeBaseCooldown } from "@primodiumxyz/core/react";
import {
  EntityType,
  formatResourceCount,
  formatTime,
  getEntityTypeName,
  parseResourceCount,
  ResourceEnumLookup,
} from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";
import { useContractCalls } from "@/hooks/useContractCalls";

export const WormholeBase: React.FC<{ building: Entity }> = ({ building }) => {
  const { tables } = useCore();
  const asteroid = tables.OwnedBy.use(building)?.value as Entity;
  if (!asteroid) return null;
  return (
    <Navigator.Screen title={building} className="w-fit grid grid-rows-2 grid-cols-2 gap-1">
      <Upgrade building={building} />
      <WormholeDeposit building={building} asteroid={asteroid} />
      {asteroid && <ExpandRange asteroid={asteroid as Entity} />}
    </Navigator.Screen>
  );
};

const WormholeDeposit: React.FC<{ building: Entity; asteroid: Entity }> = ({ building, asteroid }) => {
  const { tables } = useCore();
  const { playerAccount } = useAccountClient();
  const { wormholeDeposit } = useContractCalls();
  const [count, setCount] = useState<string>("0");
  const wormholeData = tables.WormholeResource.use();
  if (!wormholeData) throw new Error("WormholeData not found");
  const { resource: wormholeResource, nextResource, timeUntilNextResource } = wormholeData;
  const resourceData = useResourceCount(wormholeResource, asteroid);
  const { inCooldown, timeLeft } = useWormholeBaseCooldown(building);
  const multiplier = tables.P_PointMultiplier.useWithKeys({
    resource: ResourceEnumLookup[wormholeResource],
  })?.value;
  const points =
    tables.Points.useWithKeys({
      entity: playerAccount.entity as Hex,
      pointType: EPointType.Wormhole,
    })?.value ?? 0n;
  if (wormholeResource === EntityType.NULL) return null;

  const max = formatResourceCount(wormholeResource, resourceData.resourceCount, { notLocale: true, showZero: true });
  return (
    <SecondaryCard className="row-span-2 gap-2 justify-center items-center">
      <p className="text-lg flex flex-col items-center text-center">
        Teleporter
        <span className="text-xs w-3/4 center opacity-70">Deliver resources to Command</span>
      </p>
      <div className="flex flex-row items-center gap-2 text-sm">
        <img
          src={EntityToResourceImage[wormholeResource]}
          alt={getEntityTypeName(wormholeResource)}
          className="w-8 h-8"
        />
        <p>
          {(multiplier ?? 1n).toString()} pt{multiplier != 1n ? "s" : ""} / {getEntityTypeName(wormholeResource)}
        </p>
      </div>
      <p className="text-xs opacity-70">
        Next:{" "}
        <img
          src={EntityToResourceImage[nextResource]}
          alt={getEntityTypeName(nextResource)}
          className="w-6 h-6 inline"
        />{" "}
        in {formatTime(timeUntilNextResource)}
      </p>
      <p className="text-xs text-warning">
        Points earned: {formatResourceCount(wormholeResource, points, { notLocale: true, showZero: true })}
      </p>
      <NumberInput count={count} onChange={setCount} max={Number(max)} />
      {!inCooldown && (
        <TransactionQueueMask queueItemId={"DEPOSIT" as Entity} className="flex flex-col justify-center text-center">
          <Button
            disabled={count === "0"}
            size="sm"
            onClick={() => {
              // deposit wormhole resource
              wormholeDeposit(building, parseResourceCount(wormholeResource, count));
              setCount("0");
            }}
          >
            Deposit
          </Button>
        </TransactionQueueMask>
      )}
      {inCooldown && <p className="text-xs">Cooldown ends in {formatTime(timeLeft)}</p>}
    </SecondaryCard>
  );
};
