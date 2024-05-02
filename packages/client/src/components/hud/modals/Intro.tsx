import { SecondaryCard } from "@/components/core/Card";
import { Modal } from "@/components/core/Modal";
import { usePersistentStore } from "@/game/stores/PersistentStore";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useShallow } from "zustand/react/shallow";

export const Intro = () => {
  const { showIntro, setShowIntro } = usePersistentStore(
    useShallow((state) => ({ setShowIntro: state.setShowIntro, showIntro: state.showIntro }))
  );
  return (
    <Modal title="Battle of the Shards" startOpen={showIntro} onClose={() => setShowIntro(false)}>
      <Modal.Content className="w-[50rem] min-h-[25rem] p-6">
        <div className="flex flex-col p-8 h-full">
          <div className="text-center font-bold text-accent uppercase mb-2">
            Welcome to The Belt: The last hope for humanity
          </div>
          <p className="text-xs text-center">
            As mankind exhausts natural resources in the Milky Way, they turn to asteroid belts hidden within spacetime
            rifts. You are an autonomous android, engineered to survive the journey to the Belt. Battle for resources to
            ensure humanity&apos;s prosperity.
          </p>
          <br className="w-full h-4" />
          <div className="flex flex-col justify-center items-center gap-2">
            <p className="text-warning">Mission Critical</p>
            <SecondaryCard className="flex flex-row w-96 gap-2 items-center">
              <img src={InterfaceIcons.Build} alt="build" className="w-10 h-10" />
              <div className="flex flex-col">
                <p>Harvest</p>
                <p className="text-xs opacity-70">Mine resources from asteroids you control</p>
              </div>
            </SecondaryCard>
            <SecondaryCard className="flex flex-row w-96 gap-2 items-center">
              <img src={InterfaceIcons.Attack} alt="build" className="w-10 h-10" />
              <div className="flex flex-col">
                <p>Conquer</p>
                <p className="text-xs opacity-70">
                  Expand your empire by decrypting and conquering neighboring asteroids
                </p>
              </div>
            </SecondaryCard>
            <SecondaryCard className="flex flex-row w-96 gap-2 items-center">
              <img src={InterfaceIcons.Shard} alt="build" className="w-10 h-10" />
              <div className="flex flex-col">
                <p>Defend</p>
                <p className="text-xs opacity-70">Capture and defend Volatile Shards to gain Primodium</p>
              </div>
            </SecondaryCard>
            <SecondaryCard className="flex flex-row w-96 gap-2 items-center">
              <img src={InterfaceIcons.Outgoing} alt="build" className="w-10 h-10" />
              <div className="flex flex-col">
                <p>Deliver</p>
                <p className="text-xs opacity-70">Teleport your resources to Command through Wormhole Generators</p>
              </div>
            </SecondaryCard>
            <br className="w-full h-4" />
            Ready to command the stars?
            <Modal.CloseButton variant="primary" size="md">
              Begin
            </Modal.CloseButton>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
};
