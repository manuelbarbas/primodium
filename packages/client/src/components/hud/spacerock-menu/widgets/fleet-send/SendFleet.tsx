import { Entity } from "@latticexyz/recs";
import { ERock, ESendType } from "contracts/config/enums";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { Card, SecondaryCard } from "src/components/core/Card";
import { NumberInput } from "src/components/shared/NumberInput";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { formatNumber, getBlockTypeName } from "src/util/common";
import { BackgroundImage, EntityType } from "src/util/constants";
import { toHex32 } from "src/util/encode";
import { getMoveLength, toUnitCountArray } from "src/util/send";
import { send } from "src/util/web3/contractCalls/send";
import { Hex } from "viem";
import { TargetHeader } from "../../TargetHeader";
import { Modal } from "src/components/core/Modal";

export const Unit: React.FC<{ unit: Entity; count: bigint }> = ({ unit, count }) => {
  return (
    <SecondaryCard
      className={`relative flex flex-col items-center group hover:scale-105 transition-transform hover:z-50 w-full h-full ${
        count === 0n ? "opacity-25 pointer-events-none" : ""
      }`}
    >
      <img
        src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
        className={`h-[64px] bg-neutral p-2 border border-secondary pixel-images`}
      />

      {count !== 0n && (
        <Badge className="font-bold -mt-3 border-secondary">
          x{formatNumber(count, { short: true, fractionDigits: 2 })}
        </Badge>
      )}
      <NumberInput
        startingValue={Number(components.Send.getUnitCount(unit))}
        min={0}
        max={Number(count)}
        onChange={(val) => components.Send.setUnitCount(unit, BigInt(val))}
      />
      <p className="opacity-0 absolute -bottom-4 text-xs bg-error rounded-box px-1 group-hover:opacity-100 whitespace-nowrap transition-opacity uppercase">
        {getBlockTypeName(unit)}
      </p>
    </SecondaryCard>
  );
};

export const TotalStats = () => {
  const playerEntity = useMud().network.playerEntity;
  const stats = components.Send.useTotalStats(playerEntity);
  const fleet = components.Send.useUnits();
  const fleetSize = Object.values(fleet).reduce((acc, val) => acc + val, 0n);

  if (fleetSize === 0n) {
    return <div className="font-bold text-center font-sm text-error"> SELECT UNITS TO SEND </div>;
  }
  return (
    <>
      {/* <p className="text-xs font-bold opacity-75 pb-1">FLEET STATS</p> */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        <Badge className="text-xs w-full">
          <b className="text-accent mr-1">{formatNumber(stats.ATK, { short: true, fractionDigits: 1 })}</b> ATK
        </Badge>
        <Badge className="text-xs w-full">
          <b className="text-accent mr-1">{formatNumber(stats.DEF, { short: true })}</b> DEF
        </Badge>
        <Badge className="text-xs w-full">
          <b className="text-accent mr-1">{formatNumber(stats.SPD, { short: true })}</b> SPD
        </Badge>
        <Badge className="text-xs w-full">
          <b className="text-accent mr-1">{formatNumber(stats.MIN, { short: true })}</b> MIN
        </Badge>
        <Badge className="text-xs w-full">
          <b className="text-accent mr-1">{formatNumber(stats.CRG, { short: true })}</b> CRG
        </Badge>
      </div>
    </>
  );
};

export const SendFleet = () => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;

  const origin = components.Home.get(playerEntity)?.asteroid as Entity | undefined;
  const destination = components.SelectedRock.use()?.value as Entity | undefined;
  const destinationIsMine = components.OwnedBy.use(destination)?.value === playerEntity;
  const rockType = components.RockType.use(destination)?.value;
  const isPirate = components.PirateAsteroid.use(destination);
  const sendType = destinationIsMine
    ? ESendType.Reinforce
    : rockType === ERock.Asteroid || isPirate
    ? ESendType.Raid
    : ESendType.Invade;
  const fleet = components.Send.useUnits();
  const units = components.Hangar.use(origin, {
    units: [],
    counts: [],
  });

  const moveLength = useMemo(() => {
    if (Object.keys(fleet).length == 0) return;
    const originCoord = components.Position.get(origin) ?? { x: 0, y: 0 };
    const destinationCoord = components.Position.get(destination) ?? { x: 0, y: 0 };
    const moveLength = getMoveLength(originCoord, destinationCoord, playerEntity, fleet);

    return dayjs.duration(moveLength * 1000);
  }, [fleet, destination, origin, playerEntity]);

  const fleetSize = Object.values(fleet).reduce((acc, val) => acc + val, 0n);

  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!units) return 0n;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0n;
      return units.counts[index];
    },
    [units]
  );
  const sendFleet = (sendType: ESendType) => {
    if (!origin || !destination) return;
    const originCoord = components.Position.get(origin) ?? { x: 0, y: 0 };
    const destinationCoord = components.Position.get(destination) ?? { x: 0, y: 0 };

    const to = components.OwnedBy.get(destination)?.value as Entity | undefined;

    //TODO: fix arrival units
    send(toUnitCountArray(fleet), sendType, originCoord, destinationCoord, (to as Hex) ?? toHex32("0"), network);

    components.Send.reset(playerEntity);
  };
  return (
    <Card className="grid grid-cols-2 border-none w-full h-full pointer-events-auto">
      <div className="grid gap-1 h-full w-full grid-cols-4 grid-rows-2 pr-1">
        <Unit unit={EntityType.MinutemanMarine} count={getUnitCount(EntityType.MinutemanMarine)} />
        <Unit unit={EntityType.TridentMarine} count={getUnitCount(EntityType.TridentMarine)} />
        <Unit unit={EntityType.AnvilDrone} count={getUnitCount(EntityType.AnvilDrone)} />
        <Unit unit={EntityType.HammerDrone} count={getUnitCount(EntityType.HammerDrone)} />
        <Unit unit={EntityType.StingerDrone} count={getUnitCount(EntityType.StingerDrone)} />
        <Unit unit={EntityType.AegisDrone} count={getUnitCount(EntityType.AegisDrone)} />
        <Unit unit={EntityType.MiningVessel} count={getUnitCount(EntityType.MiningVessel)} />
        <div className="w-full h-full topographic-background border border-secondary/50 opacity-25" />
      </div>
      <div className="flex flex-col w-full space-y-1">
        <SecondaryCard>
          <TargetHeader />
        </SecondaryCard>
        <SecondaryCard className="flex-row items-center justify-center gap-2">
          {sendType == ESendType.Reinforce ? (
            <Button
              onClick={() => components.Send.update({ sendType: ESendType.Reinforce })}
              className={`${
                sendType === ESendType.Reinforce ? "border-warning" : "border-secondary/50"
              } disabled:opacity-100`}
            >
              <div className="flex flex-col gap-2 items-center p-2">
                <img src="img/icons/reinforcementicon.png" className="pixel-images w-12 h-12" />
                <p className="">REINFORCE</p>
              </div>
            </Button>
          ) : (
            <Button
              onClick={() => components.Send.update({ sendType })}
              className={`${
                sendType === ESendType.Invade || sendType === ESendType.Raid ? "border-warning" : "border-secondary/50"
              } disabled:opacity-100`}
            >
              <div className="flex flex-col gap-2 items-center p-2">
                <img src="img/icons/attackicon.png" className="pixel-images w-12 h-12" />
                <p className="">ATTACK</p>
              </div>
            </Button>
          )}
        </SecondaryCard>
        <SecondaryCard>
          <TotalStats />
        </SecondaryCard>
        <Modal.CloseButton
          disabled={fleetSize == 0n}
          onClick={() => sendFleet(sendType)}
          className="btn-warning font-bold h-16"
        >
          <div className="flex flex-col gap-2 items-center p-2">
            <div className="flex gap-1">
              <FaExclamationTriangle className="opacity-75 animate-pulse" /> LAUNCH FLEET
              <FaExclamationTriangle className="opacity-75 animate-pulse" />
            </div>
            {moveLength && (
              <div className="inline opacity-50 inline">
                {moveLength.hours() !== 0 && `${moveLength.hours()} hr`}
                {moveLength.minutes() !== 0 && `  ${moveLength.minutes()} min`}
                {!moveLength.hours() && moveLength.seconds() !== 0 && ` ${moveLength.seconds()} sec`}
              </div>
            )}
          </div>
        </Modal.CloseButton>
      </div>
    </Card>
  );
};
