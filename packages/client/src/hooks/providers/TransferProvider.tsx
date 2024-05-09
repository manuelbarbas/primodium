import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Entity } from "@latticexyz/recs";

interface TransferContextType {
  from: Entity | undefined;
  to: Entity | "newFleet" | undefined;
  deltas: Map<Entity, bigint>;
  moving: { from: "from" | "to"; entity: Entity; count: bigint } | null;
  hovering: "from" | "to" | null;
  setFrom: (entity: Entity | undefined) => void;
  setTo: (entity: Entity | "newFleet" | undefined) => void;
  setDelta(entity: Entity, count: bigint): void;
  setDeltas(deltas: Map<Entity, bigint>): void;
  setMoving(data: null): void;
  setMoving(data: { from: "from" | "to"; entity: Entity; count: bigint }): void;
  setHovering(data: "from" | "to" | null): void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

interface TransferContextProviderProps {
  children: ReactNode;
  initialFrom?: Entity;
  initialTo?: Entity | "newFleet";
}

export const TransferContextProvider: React.FC<TransferContextProviderProps> = ({
  children,
  initialFrom,
  initialTo,
}) => {
  const [transferContext, setTransferContext] = useState<TransferContextType>({
    from: initialFrom,
    to: initialTo,
    deltas: new Map(),
    hovering: null,
    moving: null,
    setFrom: (entity) => setTransferContext((prev) => ({ ...prev, from: entity })),
    setTo: (entity) => setTransferContext((prev) => ({ ...prev, to: entity })),
    setDelta: (entity, count) => setTransferContext((prev) => ({ ...prev, deltas: prev.deltas.set(entity, count) })),
    setDeltas: (deltas) => setTransferContext((prev) => ({ ...prev, deltas })),
    setMoving: (data) => setTransferContext((prev) => ({ ...prev, moving: data })),
    setHovering: (data) => setTransferContext((prev) => ({ ...prev, hovering: data })),
  });

  const { setDeltas, setTo, to, from } = transferContext;

  useEffect(() => {
    setDeltas(new Map());
    if (to === "newFleet" && !from) setTo(undefined);
  }, [from, to]);

  return <TransferContext.Provider value={transferContext}>{children}</TransferContext.Provider>;
};

export const useTransfer = (): TransferContextType => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfer must be used within a TransferContextProvider");
  }
  return context;
};
