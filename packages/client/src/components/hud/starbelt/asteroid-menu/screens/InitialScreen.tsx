import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { Navigator } from "src/components/core/Navigator";
import { IconLabel } from "@/components/core/IconLabel";
import { Button } from "@/components/core/Button";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { SecondaryCard } from "@/components/core/Card";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useState } from "react";
import { useClaimPrimodium, useCore, useShardAsteroid } from "@primodiumxyz/core/react";
import { EntityType, formatResourceCount, formatTime, Mode } from "@primodiumxyz/core";
import { useContractCalls } from "@/hooks/useContractCalls";

export const ShardButton: React.FC<{ shardEntity: Entity }> = ({ shardEntity }) => {
  const { tables } = useCore();
  const shardData = useShardAsteroid(shardEntity);
  const { claimShardAsteroid } = useContractCalls();
  const ownedBy = tables.OwnedBy.use(shardEntity)?.value;
  const playerEntity = tables.Account.use()?.value;
  const ownedByPlayer = ownedBy === playerEntity;

  return (
    <>
      {shardData && !shardData.canExplode && (
        <Button
          className="w-full py-3 heropattern-topography-slate-100/10 pointer-events-none"
          variant="error"
          size="content"
        >
          <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Attack} />
            <div className="flex flex-col items-start">
              <p>EXPLOSION IMMINENT</p>
              <p className="block text-xs opacity-75">{formatTime(shardData.timeUntilExplode)}</p>
            </div>
          </div>
        </Button>
      )}
      {shardData && shardData.canExplode && !ownedBy && (
        <Button
          className="w-full py-3 heropattern-topography-slate-100/10 pointer-events-none"
          variant="error"
          size="content"
        >
          <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Attack} />
            <div className="flex flex-col items-start">
              <p>EXPLOSION IMMINENT</p>
              <p className="block text-xs opacity-75">WILL EXPLODE ONCE PLAYER CONQUERS</p>
            </div>
          </div>
        </Button>
      )}
      {shardData && ownedByPlayer && shardData.canExplode && (
        <TransactionQueueMask queueItemId={"ClaimPrimodium" as Entity} className="w-full">
          <Button
            onClick={() => claimShardAsteroid(shardEntity)}
            className="w-full py-3 heropattern-topography-slate-100/10"
            variant="warning"
            size="content"
          >
            <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />
            <div className="flex flex-start px-1 gap-3 w-full">
              <IconLabel className="text-lg drop-shadow-lg" imageUri={ResourceImages.Primodium} />
              <div className="flex flex-col items-start">
                <p>CLAIM</p>
                <p className="block text-xs opacity-75">
                  ELIGIBLE FOR{" "}
                  {formatResourceCount(EntityType.Iron, shardData.explodePoints, {
                    notLocale: true,
                    fractionDigits: 2,
                  }).toLocaleString()}{" "}
                  PTS
                </p>
              </div>
            </div>
          </Button>
        </TransactionQueueMask>
      )}
      {shardData && !!ownedBy && !ownedByPlayer && shardData.canExplode && (
        <TransactionQueueMask queueItemId={"ClaimPrimodium" as Entity} className="w-full">
          <Button
            onClick={() => claimShardAsteroid(shardEntity)}
            className="w-full py-3 heropattern-topography-slate-100/10"
            variant="error"
            size="content"
          >
            <div className="flex flex-start px-1 gap-3 w-full">
              <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Attack} />
              <div className="flex flex-col items-start">
                <p>EXPLODE</p>
                <p className="block text-xs opacity-75">TRIGGER VOLATILE EXPLOSION</p>
              </div>
            </div>
          </Button>
        </TransactionQueueMask>
      )}
    </>
  );
};

export const InitialScreen = ({ selectedRock }: { selectedRock: Entity }) => {
  const { tables, utils } = useCore();
  const { claimPrimodium } = useContractCalls();
  const playerEntity = tables.Account.use()?.value;
  const ownedBy = tables.OwnedBy.use(selectedRock)?.value;
  const isShard = tables.ShardAsteroid.use(selectedRock)?.isShardAsteroid;
  const shardDescription = utils.getShardData(selectedRock)?.description;

  const primodiumData = useClaimPrimodium(selectedRock);
  return (
    <Navigator.Screen title="initial" className="gap-2 max-w-72">
      {isShard && <ShardButton shardEntity={selectedRock} />}
      {!isShard && playerEntity === ownedBy && !!primodiumData && primodiumData.points > 0 && (
        <TransactionQueueMask queueItemId={"ClaimPrimodium" as Entity}>
          <Button
            className={`w-full py-3 heropattern-topography-slate-100/10 ${
              primodiumData.canConquer ? "" : "opacity-60"
            }`}
            variant="warning"
            size="content"
            onClick={() => {
              if (!primodiumData.canConquer) return;
              claimPrimodium(selectedRock);
            }}
          >
            {primodiumData.canConquer && (
              <div className="absolute inset-0 bg-warning/25 animate-ping pointer-events-none" />
            )}
            <div className="flex flex-start px-1 gap-3 w-full">
              <IconLabel className="text-lg drop-shadow-lg" imageUri={ResourceImages.Primodium} />
              <div className="flex flex-col items-start">
                <p>Claim Primodium</p>
                <p className="block text-xs opacity-75">
                  {primodiumData.canConquer ? "CLAIM NOW" : formatTime(primodiumData.timeUntilClaim)}
                </p>
              </div>
            </div>
          </Button>
        </TransactionQueueMask>
      )}
      <Navigator.NavButton
        to="travel"
        size="content"
        variant="info"
        className="heropattern-topography-slate-100/10 py-3"
      >
        <div className="flex flex-start px-1 gap-3 w-full">
          <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Fleet} />
          <div className="flex flex-col items-start">
            <p>TRAVEL</p>
            <p className="block text-xs opacity-75">SEND A FLEET HERE</p>
          </div>
        </div>
      </Navigator.NavButton>
      <Button
        size="content"
        variant="neutral"
        onClick={() => {
          tables.SelectedMode.set({ value: Mode.CommandCenter });
        }}
      >
        <div className="flex flex-start px-1 gap-3 w-full">
          <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Command} />
          <div className="flex flex-col items-start">
            <p>COMMAND</p>
            <p className="block text-xs opacity-75">ENGAGE WITH FLEETS IN ORBIT</p>
          </div>
        </div>
      </Button>
      {!isShard && (
        <Button
          size="content"
          variant="neutral"
          onClick={() => {
            tables.ActiveRock.set({ value: selectedRock });
            ownedBy === playerEntity
              ? tables.SelectedMode.set({ value: Mode.Asteroid })
              : tables.SelectedMode.set({ value: Mode.Spectate });
          }}
        >
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel
              className="text-lg drop-shadow-lg"
              imageUri={ownedBy === playerEntity ? InterfaceIcons.Build : InterfaceIcons.Spectate}
            />
            <div className="flex flex-col items-start">
              <p>{ownedBy === playerEntity ? "BUILD" : "SPECTATE"}</p>
              <p className="block text-xs opacity-75">
                {ownedBy === playerEntity ? "EXTRACT RESOURCES" : "MONITOR LIVE ACTIVITY"}
              </p>
            </div>
          </div>
        </Button>
      )}

      {shardDescription && <ShardDescription description={shardDescription} />}
    </Navigator.Screen>
  );
};

const ShardDescription = ({ description, length = 50 }: { description: string; length?: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDescription = () => {
    setIsOpen(!isOpen);
  };
  const getShortenedDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(" ")) + "...";
  };

  return (
    <SecondaryCard className="relative w-full flex flex-col gap-1">
      <p className="text-xs">Belt History</p>
      <p className="text-xs italic opacity-60 pr-4">
        {isOpen ? description : getShortenedDescription(description, length)}
      </p>
      <Button
        variant="ghost"
        size="xs"
        className="absolute bottom-0 right-0 text-xs text-blue-500"
        onClick={toggleDescription}
      >
        {isOpen ? <FaMinus /> : <FaPlus />}
      </Button>
    </SecondaryCard>
  );
};
