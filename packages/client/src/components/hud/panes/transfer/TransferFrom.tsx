import { Entity } from "@latticexyz/recs";
import React, { useCallback, useEffect, useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { components } from "src/network/components";
import { formatResourceCount, parseResourceCount } from "src/util/number";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { TargetHeader } from "../../spacerock-menu/TargetHeader";
import { FleetEntityHeader } from "../fleets/FleetHeader";

export const TransferFrom = (props: {
  dragging?: boolean;
  sameOwner?: boolean;
  entity: Entity;
  unitCounts: Map<Entity, bigint>;
  resourceCounts: Map<Entity, bigint>;
  setDragging?: (e: React.MouseEvent, entity: Entity, count: bigint) => void;
  remove?: () => void;
}) => {
  const [keyDown, setKeyDown] = useState<string | null>();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setKeyDown("shift");
    } else if (e.key === "Meta" || e.key === "Control") {
      setKeyDown("ctrl");
    } else {
      setKeyDown(e.key);
    }
  }, []);
  const handleKeyUp = useCallback(() => setKeyDown(null), []);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, handleKeyUp]);

  const isFleet = components.IsFleet.get(props.entity)?.value;
  const Header = isFleet ? (
    <FleetEntityHeader entity={props.entity} />
  ) : (
    <TargetHeader entity={props.entity} showHousing />
  );
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
              return <div className="w-full h-full bg-black opacity-50" key={`unit-from-${index}`} />;
            const [unit, count] = [...props.unitCounts.entries()][index];
            return (
              <ResourceIcon
                key={`from-unit-${unit}`}
                className="bg-neutral/50"
                resource={unit as Entity}
                amount={count.toString()}
                setDragging={(e) =>
                  props.setDragging &&
                  props.setDragging(e, unit, keyDown == "shift" ? count : keyDown == "ctrl" ? count / 2n : 1n)
                }
              />
            );
          })}
        {props.unitCounts.size == 0 && (
          <div className="flex-1 absolute w-full h-full p-4 grid place-items-center bg-black/30">
            <p className="uppercase font-bold text-error/70">No units</p>
          </div>
        )}
      </div>

      {/*Resources*/}
      <div className="relative flex-1 flex flex-col bg-neutral p-2 grid grid-cols-4 grid-rows-2 gap-2">
        <div className="absolute left-0 w-full h-full topographic-background opacity-30 z-0" />
        {Array(8)
          .fill(0)
          .map((_, index) => {
            if (index >= props.resourceCounts.size)
              return <div key={`resource-blank-${index}`} className=" w-full h-full bg-black opacity-50 " />;
            const [entity, count] = [...props.resourceCounts.entries()][index];
            return (
              <ResourceIcon
                key={`to-resource-${entity}`}
                className="bg-neutral/50"
                resource={entity as Entity}
                amount={formatResourceCount(entity as Entity, count, { fractionDigits: 0 })}
                setDragging={(e) =>
                  props.setDragging &&
                  props.setDragging(
                    e,
                    entity,
                    keyDown == "shift" ? count : keyDown == "ctrl" ? count / 2n : parseResourceCount(entity, "1")
                  )
                }
              />
            );
          })}
        {props.resourceCounts.size == 0 && (
          <div className="flex-1 absolute w-full h-full p-4 grid place-items-center bg-black/30">
            <p className="uppercase font-bold text-error/70">No resources</p>
          </div>
        )}
      </div>

      {!props.dragging && (
        <p className="absolute bottom-2 opacity-50 text-xs italic flex items-center gap-1">
          <FaInfoCircle /> Press{" "}
          <span className={`inline kbd kbd-xs not-italic ${keyDown == "shift" ? "bg-white text-black" : ""}`}>
            Shift
          </span>{" "}
          to transfer all,
          <span className={`inline kbd kbd-xs not-italic ${keyDown == "ctrl" ? "bg-white text-black" : ""}`}>
            Ctrl
          </span>{" "}
          to transfer half
        </p>
      )}
      {props.dragging && (
        <div className="absolute bottom-2 opacity-50 text-xs italic flex items-center gap-1">
          <FaInfoCircle />
          <p>
            Press
            <span className={`inline kbd kbd-xs not-italic ${keyDown === "e" ? "bg-white text-black" : ""}`}>e</span>/
            <span className={`inline kbd kbd-xs not-italic ${keyDown === "q" ? "bg-white text-black" : ""}`}>q</span>
            to change by 1.
          </p>
          <p>
            Use
            <span className={`inline kbd kbd-xs not-italic ${keyDown === "E" ? "bg-white text-black" : ""}`}>E</span>/
            <span className={`inline kbd kbd-xs not-italic ${keyDown === "Q" ? "bg-white text-black" : ""}`}>Q</span> to
            change by 10.
          </p>
        </div>
      )}
    </div>
  );
};
