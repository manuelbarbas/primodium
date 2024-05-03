import { SecondaryCard } from "@/components/core/Card";
import { Modal } from "@/components/core/Modal";
import { usePersistentStore } from "@/game/stores/PersistentStore";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

const intervals = {
  sentence1: 1,
  sentence2: 2,
  sentence3: 2,
  sentence4: 2,
  missionCritical: 2,
  harvest: 1,
  conquer: 2,
  defend: 2,
  deliver: 2,
  ready: 1,
};

function convertToThresholds(intervals: Record<string, number>): Record<string, number> {
  const thresholds: Record<string, number> = {};
  let sum = 0;

  Object.keys(intervals).forEach((key) => {
    sum += intervals[key];
    thresholds[key] = sum;
  });

  return thresholds;
}

const thresholds = convertToThresholds(intervals) as typeof intervals;
export const Intro = () => {
  const { showIntro, setShowIntro } = usePersistentStore(
    useShallow((state) => ({ setShowIntro: state.setShowIntro, showIntro: state.showIntro }))
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const finalSeconds = Object.values(intervals).reduce((acc, val) => acc + val, 0);

  useEffect(() => {
    if (!showIntro) return;
    let intervalId = setInterval(() => {
      if (secondsElapsed >= finalSeconds) return;
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Setup the click event listener
    const handleClick = () => {
      if (secondsElapsed >= finalSeconds) return;
      intervalId && clearInterval(intervalId); // Clear existing interval
      // set seconds elapsed to match the next interval
      setSecondsElapsed((prev) => {
        const keys = Object.keys(intervals) as Array<keyof typeof intervals>;
        const key = keys.find((key) => prev < thresholds[key]);
        if (!key) return prev;
        return thresholds[key];
      });
      const newId = setInterval(() => {
        if (secondsElapsed >= finalSeconds) return;
        setSecondsElapsed((prev) => prev + 1);
      }, 1000); // Restart interval
      intervalId = newId; // Store new interval id
    };

    window.addEventListener("click", handleClick);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("click", handleClick);
    };
  }, [showIntro]);

  return (
    <Modal
      title="Battle of the Shards"
      startOpen={showIntro}
      onClose={() => setShowIntro(false)}
      blockClose={secondsElapsed < finalSeconds}
    >
      <Modal.Content className="w-[50rem] p-6">
        <div className="flex flex-col p-8 items-center h-[44rem]">
          <div className="text-center font-bold text-accent uppercase mb-2">
            Welcome to The Belt: The last hope for humanity
          </div>
          <div className="w-3/4 text-center">
            {secondsElapsed >= thresholds.sentence1 && (
              <p className="animate-in fade-in duration-500 text-center text-xs">
                A long galactic war has depleted resources in the Milky Way.
              </p>
            )}{" "}
            {secondsElapsed >= thresholds.sentence2 && (
              <p className="animate-in fade-in duration-500 text-xs">
                Rival alliances have turned to mining asteroid belts within spacetime rifts.
              </p>
            )}{" "}
          </div>

          <br className="w-full h-4" />
          <div className="w-3/4 text-center">
            {secondsElapsed >= thresholds.sentence3 && (
              <p className="animate-in fade-in duration-500 text-xs text-center">
                Command has selected you to journey to The Belt.
              </p>
            )}{" "}
            {secondsElapsed >= thresholds.sentence4 && (
              <p className="animate-in fade-in duration-500 text-xs text-center">
                Your mission: <span>battle for resources that ensure your alliance&apos;s survival.</span>
              </p>
            )}
          </div>
          <br className="w-full h-4" />
          <div className="flex flex-col justify-center items-center gap-2">
            {secondsElapsed >= thresholds.missionCritical && (
              <p className="animate-pulse duration-1000 text-warning text-center">Mission Critical</p>
            )}

            {secondsElapsed >= thresholds.harvest && (
              <SecondaryCard className="animate-in fade-in duration-500 flex flex-row w-96 gap-2 items-center">
                <img src={InterfaceIcons.Build} alt="build" className="w-10 h-10" />
                <div className="flex flex-col">
                  <p>Harvest</p>
                  <p className="text-xs opacity-70">Mine resources from asteroids you control</p>
                </div>
              </SecondaryCard>
            )}
            {secondsElapsed >= thresholds.conquer && (
              <SecondaryCard className="animate-in fade-in duration-500 flex flex-row w-96 gap-2 items-center">
                <img src={InterfaceIcons.Attack} alt="build" className="w-10 h-10" />
                <div className="flex flex-col">
                  <p>Conquer</p>
                  <p className="text-xs opacity-70">
                    Expand your empire by decrypting and conquering neighboring asteroids
                  </p>
                </div>
              </SecondaryCard>
            )}
            {secondsElapsed >= thresholds.defend && (
              <SecondaryCard className="animate-in fade-in duration-500 flex flex-row w-96 gap-2 items-center">
                <img src={InterfaceIcons.Shard} alt="build" className="w-10 h-10" />
                <div className="flex flex-col">
                  <p>Defend</p>
                  <p className="text-xs opacity-70">Capture and defend Volatile Shards to gain Primodium</p>
                </div>
              </SecondaryCard>
            )}
            {secondsElapsed >= thresholds.deliver && (
              <SecondaryCard className="animate-in fade-in duration-500 flex flex-row w-96 gap-2 items-center">
                <img src={InterfaceIcons.Outgoing} alt="build" className="w-10 h-10" />
                <div className="flex flex-col">
                  <p>Deliver</p>
                  <p className="text-xs opacity-70">Teleport your resources to Command through Wormhole Generators</p>
                </div>
              </SecondaryCard>
            )}
            <br className="w-full h-4" />
            {secondsElapsed >= thresholds.ready && (
              <div className="animate-in fade-in duration-500 flex flex-col gap-2 items-center">
                Ready to command the stars?
                <Modal.CloseButton variant="primary" size="md" className="w-fit">
                  Begin
                </Modal.CloseButton>
              </div>
            )}
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
};
