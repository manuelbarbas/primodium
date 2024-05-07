import { Entity } from "@latticexyz/recs";
import { InterfaceIcons, ResourceImages } from "@primodiumxyz/assets";
import { Navigator } from "src/components/core/Navigator";
import { components } from "@/network/components";
import { IconLabel } from "@/components/core/IconLabel";
import { Button } from "@/components/core/Button";
import { EntityType, Mode } from "@/util/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { TransactionQueueMask } from "@/components/shared/TransactionQueueMask";
import { claimShardAsteroid } from "@/network/setup/contractCalls/claimPrimodium";
import { formatResourceCount, formatTime } from "@/util/number";
import { useShardAsteroid } from "@/hooks/primodium/useShardAsteroid";
import { useMud } from "@/hooks/useMud";

export const ShardButton: React.FC<{ shardEntity: Entity }> = ({ shardEntity }) => {
  const mud = useMud();
  const shardData = useShardAsteroid(shardEntity);
  const ownedBy = components.OwnedBy.use(shardEntity)?.value;
  const playerEntity = components.Account.use()?.value;
  const ownedByPlayer = ownedBy === playerEntity;

  return (
    <>
      {shardData && !shardData.canExplode && (
        <Button className="w-full py-3 heropattern-topography-slate-100/10" variant="error" size="content" disabled>
          <div className="absolute inset-0 bg-error/25 animate-ping pointer-events-none" />
          <div className="flex flex-start px-1 gap-3 w-full">
            <IconLabel className="text-lg drop-shadow-lg" imageUri={InterfaceIcons.Attack} />
            <div className="flex flex-col items-start">
              <p>EXPLOSION IMINENT</p>
              <p className="block text-xs opacity-75">EXPLOSION IN T-{formatTime(shardData.timeUntilExplode)}</p>
            </div>
          </div>
        </Button>
      )}
      {shardData && !ownedByPlayer && shardData.canExplode && (
        <TransactionQueueMask queueItemId={"ClaimPrimodium" as Entity} className="w-full">
          <Button
            onClick={() => claimShardAsteroid(mud, shardEntity)}
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
            onClick={() => claimShardAsteroid(mud, shardEntity)}
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
  const playerEntity = components.Account.use()?.value;
  const ownedBy = components.OwnedBy.use(selectedRock)?.value;
  const selectedAsteroid = components.SelectedRock.use()?.value;
  const isShard = components.ShardAsteroid.use(selectedRock)?.isShardAsteroid;

  return (
    <Navigator.Screen title="initial" className="gap-2">
      {isShard && <ShardButton shardEntity={selectedRock} />}
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
          components.SelectedMode.set({ value: Mode.CommandCenter });
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
            components.ActiveRock.set({ value: selectedAsteroid ?? singletonEntity });
            ownedBy === playerEntity
              ? components.SelectedMode.set({ value: Mode.Asteroid })
              : components.SelectedMode.set({ value: Mode.Spectate });
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
    </Navigator.Screen>
  );
};
