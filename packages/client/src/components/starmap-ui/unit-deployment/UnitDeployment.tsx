import { useState } from "react";
import { HangarPane } from "./HangarPane";
import { FleetPane } from "./FleetPane";
import { AnimatePresence } from "framer-motion";
import Modal from "src/components/shared/Modal";

export const UnitDeployment: React.FC = () => {
  const [showHangar, setShowHangar] = useState(false);

  return (
    <div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen pointer-events-auto flex items-center justify-center px-4">
        <AnimatePresence>
          <FleetPane key="fleet" setShowHangar={setShowHangar} />
        </AnimatePresence>
      </div>

      <div className="pointer-events-auto">
        <Modal
          title="Hangar"
          show={showHangar}
          onClose={() => {
            setShowHangar(false);
          }}
        >
          <HangarPane key="hangar" show={showHangar} setShow={setShowHangar} />
        </Modal>
      </div>
    </div>
  );
};
