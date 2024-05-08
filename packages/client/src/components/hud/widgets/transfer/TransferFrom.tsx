import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { useInCooldownEnd } from "src/hooks/useCooldownEnd";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToFleetName } from "src/util/name";
import { formatResourceCount, formatTime, parseResourceCount } from "src/util/number";
import { getUnitStats } from "src/util/unit";
import { TargetHeader } from "../../../shared/TargetHeader";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { FleetHeader } from "../fleets/FleetHeader";
import { hydrateFleetData } from "src/network/sync/indexer";

export const TransferFrom = (props: {
  dragging?: boolean;
  sameOwner?: boolean;
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  deltas?: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  remove?: () => void;
}) => {
  const mud = useMud();
  const {
    playerAccount: { entity: playerEntity },
  } = mud;
  const [keyDown, setKeyDown] = useState("");
  const { inCooldown, duration } = useInCooldownEnd(props.entity as Entity);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setKeyDown("shift");
    } else if (e.key === "Alt") {
      setKeyDown("alt");
    } else {
      setKeyDown(e.key);
    }
  }, []);
  const handleKeyUp = useCallback(() => setKeyDown(""), []);

  const isOwnedByPlayer = useMemo(() => {
    const isFleet = !!components.IsFleet.get(props.entity)?.value;

    let owner;
    if (isFleet) {
      const spacerock = (components.OwnedBy.get(props.entity)?.value ?? singletonEntity) as Entity;
      owner = components.OwnedBy.get(spacerock)?.value;
    } else {
      owner = components.OwnedBy.get(props.entity)?.value;
    }

    return owner === playerEntity;
  }, [props.entity, playerEntity]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleKeyUp]);

  const isFleet = components.IsFleet.get(props.entity)?.value;
  const Header = useMemo(() => {
    if (!isFleet && props.entity !== "newFleet") {
      return <TargetHeader entity={props.entity} />;
    }
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };
    const ownerRock = props.entity !== "newFleet" ? components.OwnedBy.get(props.entity)?.value : undefined;
    props.unitCounts.forEach((count, unit) => {
      if (count === 0n) return;
      const unitData = getUnitStats(unit as Entity, ownerRock as Entity);
      data.attack += unitData.ATK * count;
      data.defense += unitData.CTR * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CGO * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });

    return <FleetHeader title={entityToFleetName(props.entity)} {...data} />;
  }, [isFleet, props.entity, props.unitCounts]);

  useEffect(() => {
    if (!components.IsFleet.get(props.entity)?.value) return;

    hydrateFleetData(props.entity, mud);
  }, [props.entity, mud]);

  return (
    <div className={`w-full h-full bg-base-100 p-2 pb-8 flex flex-col gap-2 border border-secondary/50 relative`}>
      <div className="relative h-12 text-sm w-full flex justify-center font-bold gap-1">
        {Header}
        {props.remove && (
          <Button className="absolute -top-1 -right-1 btn-error p-1 btn-xs" onClick={props.remove}>
            <FaTimes />
          </Button>
        )}
      </div>

      {/*Units*/}
      <div className="relative flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        {Array(8)
          .fill(0)
          .map((_, index) => {
            if (index >= props.unitCounts.size)
              return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
            const [unit, count] = [...props.unitCounts.entries()][index];
            const delta = props.deltas?.get(unit);
            return (
              <ResourceIcon
                key={`from-unit-${unit}`}
                disabled={unit === EntityType.ColonyShip && !props.sameOwner}
                className="bg-neutral/50"
                resource={unit as Entity}
                amount={count.toString()}
                delta={delta ? 0n - delta : undefined}
                setDragging={(e) =>
                  props.setDragging &&
                  props.setDragging(e, unit, keyDown == "shift" ? count : keyDown == "alt" ? count / 2n : 1n)
                }
              />
            );
          })}
        {props.unitCounts.size == 0 && (
          <div className="flex-1 absolute w-full h-full p-4 grid place-items-center bg-black/50">
            <p className="uppercase font-bold text-error">No units</p>
          </div>
        )}
      </div>

      {/*Resources*/}
      <div className="relative flex-1 flex flex-col bg-neutral p-2 grid grid-cols-5 grid-rows-2 gap-2">
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        {Array(10)
          .fill(0)
          .map((_, index) => {
            if (index >= props.resourceCounts.size)
              return <div key={`resource-blank-${index}`} className=" w-full h-full bg-white/10 opacity-50 " />;
            const [entity, count] = [...props.resourceCounts.entries()][index];
            const delta = props.deltas?.get(entity);
            return (
              <ResourceIcon
                key={`to-resource-${entity}`}
                className="bg-neutral/50"
                resource={entity as Entity}
                delta={delta ? 0n - delta : undefined}
                amount={formatResourceCount(entity as Entity, count, { fractionDigits: 0 })}
                setDragging={(e) =>
                  props.setDragging &&
                  props.setDragging(
                    e,
                    entity,
                    keyDown == "shift" ? count : keyDown == "alt" ? count / 2n : parseResourceCount(entity, "1")
                  )
                }
              />
            );
          })}
        {props.resourceCounts.size == 0 && (
          <div className="flex-1 absolute w-full h-full p-4 grid place-items-center bg-black/50">
            <p className="uppercase font-bold text-error">No resources</p>
          </div>
        )}
      </div>

      <p className="absolute bottom-2 opacity-50 text-xs italic flex items-center gap-1">
        {!props.dragging && (
          <>
            <FaInfoCircle /> Hold
            <span className={`inline kbd kbd-xs not-italic ${keyDown == "shift" ? "bg-white text-black" : ""}`}>
              Shift
            </span>
            to transfer all,
            <span className={`inline kbd kbd-xs not-italic ${keyDown == "alt" ? "bg-white text-black" : ""}`}>Alt</span>
            to transfer half
          </>
        )}
        {props.dragging && (
          <>
            <FaInfoCircle />
            Press
            <span
              className={`inline kbd kbd-xs not-italic ${
                ["q", "œ", "Q"].includes(keyDown) ? "bg-white text-black" : ""
              }`}
            >
              q
            </span>
            /
            <span
              className={`inline kbd kbd-xs not-italic ${
                ["e", "E", "Dead"].includes(keyDown) ? "bg-white text-black" : ""
              }`}
            >
              e
            </span>
            to change by 1. Press
            <span
              className={`inline kbd kbd-xs not-italic ${
                ["a", "A", "å"].includes(keyDown) ? "bg-white text-black" : ""
              }`}
            >
              a
            </span>
            /
            <span
              className={`inline kbd kbd-xs not-italic ${
                ["d", "D", "∂"].includes(keyDown) ? "bg-white text-black" : ""
              }`}
            >
              d
            </span>{" "}
            to change by 100.
          </>
        )}
      </p>
      {!isOwnedByPlayer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/75 pointer-events-auto text-error uppercase">
          <p>NOT OWNED BY YOU</p>
        </div>
      )}
      {inCooldown && isOwnedByPlayer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/75 pointer-events-auto text-error uppercase">
          <p className="font-bold">On Cooldown</p>
          <p>{formatTime(duration)}</p>
        </div>
      )}
    </div>
  );
};
