import { singletonEntity } from "@latticexyz/store-sync/recs";
import { AnimatePresence, motion } from "framer-motion";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { Keys } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Loader } from "../../core/Loader";

export const AsteroidLoading = () => {
  const activeRock = components.ActiveRock.use()?.value ?? singletonEntity;
  const syncId = hashEntities(Keys.ACTIVE, activeRock);
  const { loading } = useSyncStatus(syncId);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key={syncId}
          id={syncId}
          initial={{
            opacity: 1,
          }}
          exit={{ opacity: 0, transition: { delay: 1.5, duration: 0.5 } }}
          className="absolute inset-0 pointer-events-auto bg-neutral/50 backdrop-blur-3xl flex flex-col items-center justify-center text-xl uppercase font-bold"
        >
          <Loader />
          Loading Asteroid
        </motion.div>
      )}
    </AnimatePresence>
  );
};
