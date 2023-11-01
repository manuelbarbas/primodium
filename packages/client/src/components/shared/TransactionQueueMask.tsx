import { components } from "src/network/components";
import { Entity } from "@latticexyz/recs";
import { Loader } from "../core/Loader";

export const TransactionQueueMask: React.FC<{
  children: React.ReactNode;
  queueItemId: Entity;
  className?: string;
}> = ({ children, queueItemId, className }) => {
  const queuePosition = components.TransactionQueue.useIndex(queueItemId);

  if (queuePosition === -1) return <div className={className}>{children}</div>;

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-black/75 rounded-box">
        {queuePosition !== 0 && (
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-black rounded-full px-2 border border-secondary text-xs">
            {queuePosition}
          </div>
        )}
        {queuePosition === 0 && (
          <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};
