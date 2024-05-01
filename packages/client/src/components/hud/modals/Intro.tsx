import { Button } from "@/components/core/Button";
import { Modal } from "@/components/core/Modal";
import { usePersistentStore } from "@/game/stores/PersistentStore";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

export const Intro = () => {
  const { showIntro, setShowIntro } = usePersistentStore(
    useShallow((state) => ({ setShowIntro: state.setShowIntro, showIntro: state.showIntro }))
  );
  const [page, setPage] = useState(0);

  return (
    <Modal title="Battle of the Shards" startOpen={showIntro}>
      <Modal.Content className="w-[50rem] min-h-[25rem] font-mono p-6">
        {page === 0 && <PageZero onContinue={() => setPage(1)} />}
        {page === 1 && <PageOne final onContinue={() => setShowIntro(false)} />}
      </Modal.Content>
    </Modal>
  );
};

type PageProps = {
  onContinue?: () => void;
  final?: boolean;
};
const PageZero = (props: PageProps) => {
  const Btn = props.final ? Modal.CloseButton : Button;
  return (
    <div className="flex flex-col gap-6 p-8 h-full">
      <div className="text-center font-bold text-accent uppercase gap-6">Welcome to The Belt.</div>
      <p className="text-sm">
        For thousands of years, humanity has waged a galactic war across the stars. But over time, these warring
        alliances have run out of resources in the Milky Way.
      </p>
      <p className="text-sm">
        Scientists recently found rifts in time that led to The Belt. No organic matter can pass through these rifts, so
        Space Command sent you, an autonomous android, to mine resources and investigate signals of a mysterious new
        resource.
      </p>
      <p className="font-bold">
        <span className="text-warning uppercase text-center">Your mission:</span>{" "}
        <ul className="gap-1 pl-4">
          <li>1. Harvest resources and teleport them to Space Command through wormholes.</li>
          <li>2. Seek out and harvest Primodium, a new type of renewable energy.</li>
        </ul>
      </p>
      <Btn onClick={props.onContinue} variant="primary" className="self-end">
        Continue
      </Btn>
    </div>
  );
};

const PageOne = (props: PageProps) => {
  const Btn = props.final ? Modal.CloseButton : Button;
  return (
    <div className="flex flex-col gap-6 p-8 h-full">
      <p className="text-sm">
        To send resources to Space Command, construct a <span className="text-success">Wormhole Generator</span> on a
        Wormhole Asteroid. Beware -- the needs of Space Command are constantly changing!
      </p>
      <p className="text-sm">
        Sensors have detected the presence of a valuable new energy source, <span className="text-info">Primodium</span>
        , located on volatile shards in The Belt. Mine these shards and defend them from other alliances.
      </p>
      <p className="font-bold uppercase text-center text-warning">GOOD LUCK!</p>
      <div className="w-full grid place-items-center">
        <Btn onClick={props.onContinue} size="md" variant="secondary" className="w-fit">
          Begin
        </Btn>
      </div>
    </div>
  );
};
