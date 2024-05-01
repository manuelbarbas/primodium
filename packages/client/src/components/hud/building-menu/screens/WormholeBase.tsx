import { Entity } from "@latticexyz/recs";
import { useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { NumberInput } from "src/components/core/NumberInput";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useWormholeBaseCooldown } from "src/hooks/wormhole/useWormholeBaseCooldown";
import { useWormholeResource } from "src/hooks/wormhole/useWormholeResource";
import { components } from "src/network/components";
import { wormholeDeposit } from "src/network/setup/contractCalls/wormholeDeposit";
import { getEntityTypeName } from "src/util/common";
import { EntityType, ResourceEnumLookup } from "src/util/constants";
import { formatResourceCount, formatTime, parseResourceCount } from "src/util/number";
import { ExpandRange } from "../widgets/ExpandRange";
import { Upgrade } from "../widgets/Upgrade";

export const WormholeBase: React.FC<{ building: Entity }> = ({ building }) => {
  const asteroid = components.OwnedBy.use(building)?.value as Entity;
  if (!asteroid) return null;
  return (
    <Navigator.Screen title={building} className="w-fit gap-1">
      <Upgrade building={building} />
      {asteroid && <ExpandRange asteroid={asteroid as Entity} />}
      <WormholeDeposit building={building} asteroid={asteroid} />
    </Navigator.Screen>
  );
};

const WormholeDeposit: React.FC<{ building: Entity; asteroid: Entity }> = ({ building, asteroid }) => {
  const [count, setCount] = useState<string>("0");
  const mud = useMud();
  const { resource: wormholeResource, nextResource, timeUntilNextResource } = useWormholeResource();
  const resourceData = useFullResourceCount(wormholeResource, asteroid);
  const { inCooldown, timeLeft } = useWormholeBaseCooldown(building);
  const multiplier = components.P_ScoreMultiplier.useWithKeys({
    resource: ResourceEnumLookup[wormholeResource],
  })?.value;
  if (wormholeResource === EntityType.NULL) return null;

  const max = formatResourceCount(wormholeResource, resourceData.resourceCount, { notLocale: true, showZero: true });
  return (
    <SecondaryCard className="w-full items-center">
      <TransactionQueueMask queueItemId={"DEPOSIT" as Entity} className="flex flex-col justify-center text-center">
        <p>WORMHOLE DEPOSIT</p>
        <p className="text-xs">
          Next resource ({getEntityTypeName(nextResource)}) in {formatTime(timeUntilNextResource)}
        </p>
        <div className="flex gap-1 mb-6 w-full text-xs items-center justify-center">
          <div className="flex flex-col items-center h-full">
            <p>Current: {getEntityTypeName(wormholeResource)}</p>
            <p className="opacity-50">
              {(multiplier ?? 1n).toString()} pts / {getEntityTypeName(wormholeResource)}
            </p>
          </div>
          <NumberInput count={count} onChange={setCount} max={Number(max)} />
        </div>
        {!inCooldown && (
          <Button
            className="btn-sm"
            onClick={() => {
              // deposit wormhole resource
              wormholeDeposit(mud, building, parseResourceCount(wormholeResource, count));
              setCount("0");
            }}
          >
            Deposit
          </Button>
        )}
        {inCooldown && <p className="text-xs">Cooldown ends in {formatTime(timeLeft)}</p>}
      </TransactionQueueMask>
    </SecondaryCard>
  );
};
