import { Button } from "@/components/core/Button";
import { EntityToResourceImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { EPointType } from "contracts/config/enums";
import { useState } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { NumberInput } from "src/components/core/NumberInput";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useWormholeBaseCooldown } from "src/hooks/wormhole/useWormholeBaseCooldown";
import { components } from "src/network/components";
import { wormholeDeposit } from "src/network/setup/contractCalls/wormholeDeposit";
import { getEntityTypeName } from "src/util/common";
import { EntityType, ResourceEnumLookup } from "src/util/constants";
import { formatResourceCount, formatTime, parseResourceCount } from "src/util/number";
import { Hex } from "viem";
import { ExpandRange } from "../widgets/ExpandRange";
import { Upgrade } from "../widgets/Upgrade";

export const WormholeBase: React.FC<{ building: Entity }> = ({ building }) => {
  const asteroid = components.OwnedBy.use(building)?.value as Entity;
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
  const [count, setCount] = useState<string>("0");
  const mud = useMud();
  const wormholeData = components.WormholeResource.use();
  if (!wormholeData) throw new Error("WormholeData not found");
  const { resource: wormholeResource, nextResource, timeUntilNextResource } = wormholeData;
  const resourceData = useFullResourceCount(wormholeResource, asteroid);
  const { inCooldown, timeLeft } = useWormholeBaseCooldown(building);
  const multiplier = components.P_PointMultiplier.useWithKeys({
    resource: ResourceEnumLookup[wormholeResource],
  })?.value;
  const isGameOver = components.VictoryStatus.use()?.gameOver ?? false;
  const points =
    components.Points.useWithKeys({
      entity: mud.playerAccount.entity as Hex,
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
          {(isGameOver ? 0n : multiplier ?? 1n).toString()} pt{multiplier != 1n ? "s" : ""} /{" "}
          {getEntityTypeName(wormholeResource)}
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
              wormholeDeposit(mud, building, parseResourceCount(wormholeResource, count));
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
