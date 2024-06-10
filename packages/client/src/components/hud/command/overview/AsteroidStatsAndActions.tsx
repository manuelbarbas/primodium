import { Button } from "@/components/core/Button";
import { alert } from "@/util/alert";
import { CapacityBar } from "@/components/core/CapacityBar";
import { Tabs } from "@/components/core/Tabs";
import { useMud } from "@/react/hooks";
import { useAsteroidStrength } from "@/react/hooks/useAsteroidStrength";
import { useFullResourceCount } from "@/react/hooks/useFullResourceCount";
import { components } from "@/network/components";
import { abandonAsteroid } from "@/network/setup/contractCalls/forfeit";
import { EntityType } from "@/util/constants";
import { EntityToResourceImage } from "@/util/mappings";
import { formatResourceCount } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

export const AsteroidStats = ({
  asteroid,
  segments = 10,
  showHints,
}: {
  asteroid: Entity;
  segments?: number;
  showHints?: boolean;
}) => {
  const { resourceCount: encryption, resourceStorage: maxEncryption } = useFullResourceCount(
    EntityType.Encryption,
    asteroid
  );
  const { strength, maxStrength } = useAsteroidStrength(asteroid);
  const encryptionImg = EntityToResourceImage[EntityType.Encryption] ?? "";
  const strengthImg = EntityToResourceImage[EntityType.HP] ?? "";
  return (
    <div className="flex gap-4 justify-center w-full">
      <div className="flex gap-2 items-center">
        {showHints && <Hints />}
        <img src={encryptionImg} className="w-4 h-4" alt="encryption" />
        <CapacityBar current={encryption} max={maxEncryption} segments={segments} className="w-24" />
        <p>{formatResourceCount(EntityType.Encryption, encryption, { short: true })}</p>
      </div>
      <div className="flex gap-2 items-center">
        <img src={strengthImg} className="w-4 h-4" alt="strength" />
        <CapacityBar current={strength} max={maxStrength} segments={segments} className="w-24" />
        <p className="min-w-5">{formatResourceCount(EntityType.Defense, strength, { short: true })}</p>
      </div>
    </div>
  );
};

const Hints = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    //handle click outside and set show to false
    const handleClick = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest(".dropdown")) setShow(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex items-center text-xs z-50">
      <div className="dropdown dropdown-top">
        <label tabIndex={0} className="btn btn-circle btn-ghost btn-xs" onClick={() => setShow(!show)}>
          <FaInfoCircle size={16} />
        </label>
        {show && (
          <div
            tabIndex={0}
            className="absolute card compact dropdown-content z-[1] shadow bg-base-100 w-60 p-2 m-1 border border-secondary gap-1"
          >
            <p className="text-accent">To attack a fleet/asteroid</p>
            <p className="opacity-70">Select an enemy fleet or asteroid to initiate an attack</p>
            <hr className="opacity-70 col-span-2" />
            <p className="text-accent col-span-2">Manage fleet</p>
            <p className="opacity-70">
              Select a friendly fleet to set its stance, set a new home base, or clear its inventory
            </p>
            <hr className="opacity-70 col-span-2" />
            <p className="text-accent col-span-2">Create Fleet/Transfer Resources</p>
            <p className="opacity-70 flex">
              You can create a new fleet or manage existing fleets by visiting the Transfer Inventory tab
            </p>
            <hr className="opacity-70 col-span-2" />
            <p className="text-accent col-span-2">Abandon</p>
            <p className="opacity-70 flex">
              Abandoning this asteroid will remove all fleets and resources. You will lose ownership of this asteroid
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButtons = ({ asteroid, onClick }: { asteroid: Entity; onClick?: () => void }) => {
  const mud = useMud();
  const playerEntity = mud.playerAccount.entity;
  const asteroidOwner = components.OwnedBy.use(asteroid)?.value;
  const canBuildFleet = useFullResourceCount(EntityType.FleetCount, asteroid).resourceCount > 0n;
  if (!asteroidOwner || asteroidOwner !== playerEntity) return null;
  return (
    <div className="flex gap-2 items-center justify-center">
      <Tabs.Button disabled={!canBuildFleet} index={1} onClick={onClick} variant="secondary" size="sm">
        + CREATE FLEET
      </Tabs.Button>
      <Button
        variant="error"
        size="sm"
        onClick={() => alert("Are you sure you want to abandon this asteroid?", () => abandonAsteroid(mud, asteroid))}
      >
        ABANDON
      </Button>
    </div>
  );
};

export const AsteroidStatsAndActions = ({ onClickCreateFleet }: { onClickCreateFleet?: () => void }) => {
  const playerEntity = components.Account.use()?.value;
  const selectedAsteroid = components.SelectedRock.use()?.value;
  const homeAsteroid = components.Home.use(playerEntity)?.value;

  const asteroid = (selectedAsteroid ?? homeAsteroid) as Entity;
  if (!asteroid) return null;

  return (
    <div className="flex flex-col items-center gap-4 pointer-events-auto">
      <AsteroidStats asteroid={asteroid} showHints />
      <ActionButtons asteroid={asteroid} onClick={onClickCreateFleet} />
    </div>
  );
};
