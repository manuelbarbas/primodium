import { Entity } from "@latticexyz/recs";
import React from "react";
import { FaTrash } from "react-icons/fa";
import { Button } from "src/components/core/Button";
import { ResourceImage } from "src/util/constants";

export const ResourceIcon = ({
  resource,
  amount,
  setDragging = () => null,
  onClear,
  size = "md",
}: {
  resource: Entity;
  amount: string;
  setDragging?: (e: React.MouseEvent, entity: Entity) => void;
  onClear?: (entity: Entity) => void;
  size?: "sm" | "md";
}) => (
  <div
    onMouseDown={(e) => setDragging(e, resource)}
    className="relative flex flex-col gap-1 items-center justify-center bg-neutral border border-primary w-full h-full p-2"
  >
    <img
      src={ResourceImage.get(resource) ?? ""}
      className={`pixel-images ${size == "md" ? "w-14" : "w-10"} scale-200 font-bold text-lg pointer-events-none`}
    />
    <p className={`${size == "sm" ? "text-sm" : ""} font-bold`}>{amount}</p>
    {onClear && (
      <Button className="btn-ghost btn-xs absolute bottom-0 right-0" onClick={() => onClear(resource)}>
        <FaTrash className="text-error" />
      </Button>
    )}
  </div>
);
